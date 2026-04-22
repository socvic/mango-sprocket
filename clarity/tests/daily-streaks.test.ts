/**
 * Unit tests for the daily-streaks Clarity contract.
 * Uses Clarinet SDK simnet for on-chain simulation.
 */
import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;
const wallet3 = accounts.get("wallet_3")!;

describe("daily-streaks", () => {
    it("initial check-in starts streak and updates totals", () => {
        const checkIn = simnet.callPublicFn("daily-streaks", "check-in", [], wallet1);

        expect(checkIn.result).toBeOk(
            Cl.tuple({
                streak: Cl.uint(1),
                "best-streak": Cl.uint(1),
                "badge-level": Cl.uint(0),
                "total-checkins": Cl.uint(1),
                "freeze-passes": Cl.uint(1),
            }),
        );

        const canCheck = simnet.callReadOnlyFn(
            "daily-streaks",
            "can-check-in",
            [Cl.principal(wallet1)],
            wallet1,
        );

        expect(canCheck.result).toBeOk(Cl.bool(false));
    });

    it("rejects a second check-in before the next window", () => {
        simnet.callPublicFn("daily-streaks", "check-in", [], wallet1);
        const second = simnet.callPublicFn("daily-streaks", "check-in", [], wallet1);

        expect(second.result).toBeErr(Cl.uint(100));
    });

    it("continues streak after the check-in window opens", () => {
        simnet.callPublicFn("daily-streaks", "check-in", [], wallet1);
        simnet.mineEmptyBlocks(144);

        const second = simnet.callPublicFn("daily-streaks", "check-in", [], wallet1);

        expect(second.result).toBeOk(
            Cl.tuple({
                streak: Cl.uint(2),
                "best-streak": Cl.uint(2),
                "badge-level": Cl.uint(0),
                "total-checkins": Cl.uint(2),
                "freeze-passes": Cl.uint(1),
            }),
        );
    });

    it("resets streak when user misses continuation window", () => {
        simnet.callPublicFn("daily-streaks", "check-in", [], wallet1);
        simnet.mineEmptyBlocks(170);

        const second = simnet.callPublicFn("daily-streaks", "check-in", [], wallet1);

        expect(second.result).toBeOk(
            Cl.tuple({
                streak: Cl.uint(1),
                "best-streak": Cl.uint(1),
                "badge-level": Cl.uint(0),
                "total-checkins": Cl.uint(2),
                "freeze-passes": Cl.uint(1),
            }),
        );
    });

    it("keeps best-streak after reset", () => {
        simnet.callPublicFn("daily-streaks", "check-in", [], wallet1);
        simnet.mineEmptyBlocks(144);
        simnet.callPublicFn("daily-streaks", "check-in", [], wallet1);
        simnet.mineEmptyBlocks(170);

        const third = simnet.callPublicFn("daily-streaks", "check-in", [], wallet1);

        expect(third.result).toBeOk(
            Cl.tuple({
                streak: Cl.uint(1),
                "best-streak": Cl.uint(2),
                "badge-level": Cl.uint(0),
                "total-checkins": Cl.uint(3),
                "freeze-passes": Cl.uint(1),
            }),
        );
    });

    it("tracks total users and total check-ins globally", () => {
        simnet.callPublicFn("daily-streaks", "check-in", [], wallet1);
        simnet.callPublicFn("daily-streaks", "check-in", [], wallet2);

        const stats = simnet.callReadOnlyFn(
            "daily-streaks",
            "get-global-stats",
            [],
            wallet1,
        );

        expect(stats.result).toBeOk(
            Cl.tuple({
                "total-users": Cl.uint(2),
                "total-checkins": Cl.uint(2),
                "total-challenges": Cl.uint(0),
                "total-groups": Cl.uint(0),
            }),
        );
    });

    it("stores a proof note and latest note lookup", () => {
        const note = "shipped onboarding flow";
        simnet.callPublicFn(
            "daily-streaks",
            "check-in-with-note",
            [Cl.some(Cl.stringUtf8(note))],
            wallet1,
        );

        const latest = simnet.callReadOnlyFn(
            "daily-streaks",
            "get-latest-note",
            [Cl.principal(wallet1)],
            wallet1,
        );

        expect(latest.result).toBeOk(Cl.some(Cl.stringUtf8(note)));
    });

    it("reaches first badge at 7 streak", () => {
        simnet.callPublicFn("daily-streaks", "check-in", [], wallet1);
        for (let i = 0; i < 6; i++) {
            simnet.mineEmptyBlocks(144);
            simnet.callPublicFn("daily-streaks", "check-in", [], wallet1);
        }

        const badge = simnet.callReadOnlyFn(
            "daily-streaks",
            "get-badge-level",
            [Cl.principal(wallet1)],
            wallet1,
        );

        expect(badge.result).toBeOk(Cl.uint(1));
    });

    it("supports challenge create, join, and submission", () => {
        const start = simnet.blockHeight;
        const end = start + 300;

        const created = simnet.callPublicFn(
            "daily-streaks",
            "create-challenge",
            [Cl.stringUtf8("30 day shipping"), Cl.uint(start), Cl.uint(end)],
            wallet1,
        );

        expect(created.result).toBeOk(Cl.uint(1));

        const joined = simnet.callPublicFn("daily-streaks", "join-challenge", [Cl.uint(1)], wallet2);
        expect(joined.result).toBeOk(Cl.bool(true));

        const submitted = simnet.callPublicFn(
            "daily-streaks",
            "submit-challenge-checkin",
            [Cl.uint(1), Cl.none()],
            wallet2,
        );

        expect(submitted.result).toBeOk(
            Cl.tuple({
                streak: Cl.uint(1),
                "badge-level": Cl.uint(0),
                "challenge-submissions": Cl.uint(1),
            }),
        );
    });

    it("supports friend relationship and friend streak view", () => {
        simnet.callPublicFn("daily-streaks", "check-in", [], wallet2);
        const add = simnet.callPublicFn("daily-streaks", "add-friend", [Cl.principal(wallet2)], wallet1);
        expect(add.result).toBeOk(Cl.bool(true));

        const friendStreak = simnet.callReadOnlyFn(
            "daily-streaks",
            "get-friend-streak",
            [Cl.principal(wallet2)],
            wallet1,
        );

        expect(friendStreak.result).toBeOk(Cl.uint(1));
    });

    it("supports group create and join", () => {
        const created = simnet.callPublicFn(
            "daily-streaks",
            "create-group",
            [Cl.stringUtf8("builders"), Cl.uint(3)],
            wallet1,
        );
        expect(created.result).toBeOk(Cl.uint(1));

        const joined = simnet.callPublicFn("daily-streaks", "join-group", [Cl.uint(1)], wallet3);
        expect(joined.result).toBeOk(Cl.bool(true));

        const isMember = simnet.callReadOnlyFn(
            "daily-streaks",
            "is-group-member",
            [Cl.uint(1), Cl.principal(wallet3)],
            wallet1,
        );
        expect(isMember.result).toBeOk(Cl.bool(true));
    });

    it("allows freeze pass to preserve streak after one missed window", () => {
        simnet.callPublicFn("daily-streaks", "check-in", [], wallet1);
        simnet.mineEmptyBlocks(170);

        const freeze = simnet.callPublicFn("daily-streaks", "use-freeze-pass", [], wallet1);
        expect(freeze.result).toBeOk(
            Cl.tuple({
                streak: Cl.uint(1),
                "freeze-passes": Cl.uint(0),
            }),
        );
    });
});
