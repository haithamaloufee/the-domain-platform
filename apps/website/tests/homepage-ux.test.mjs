import assert from "node:assert/strict";
import test from "node:test";
import {
  countUpDurationMs,
  easeOutCubic,
  formatStatisticValue,
  parseStatisticTarget,
  shouldStartNavigationTransition,
  snakeMotionEpsilon,
  snakeVelocityFromScrollDelta,
  statisticFinalLabel,
  stepSnakeMotion,
} from "../src/lib/homepage-ux.ts";

test("statistics keep exact targets and suffixes across the count easing", () => {
  const statistics = [
    ["10", "+"],
    ["75", "+"],
    ["120", "K+"],
    ["50", "+"],
  ];
  assert.equal(countUpDurationMs, 1_450);
  assert.equal(easeOutCubic(0), 0);
  assert.equal(easeOutCubic(1), 1);
  assert.equal(easeOutCubic(2), 1);
  assert.deepEqual(
    statistics.map(([source, suffix]) => {
      const target = parseStatisticTarget(source);
      assert.notEqual(target, null);
      return {
        finalLabel: statisticFinalLabel(source, suffix),
        value: formatStatisticValue(target, source),
      };
    }),
    [
      { finalLabel: "10+", value: "10" },
      { finalLabel: "75+", value: "75" },
      { finalLabel: "120K+", value: "120" },
      { finalLabel: "50+", value: "50" },
    ],
  );
});

test("snake velocity clamps, reverses with scroll direction, wraps, and reaches idle", () => {
  assert.equal(snakeVelocityFromScrollDelta(100), -24);
  assert.equal(snakeVelocityFromScrollDelta(-100), 24);
  assert.equal(snakeVelocityFromScrollDelta(0), 0);

  let state = { offset: 0, targetVelocity: snakeVelocityFromScrollDelta(12), velocity: 0 };
  let step = stepSnakeMotion(state, 320);
  assert.ok(step.velocity < 0);
  assert.ok(Number.isFinite(step.offset));
  assert.ok(step.offset >= 0 && step.offset < 320);
  for (let index = 0; index < 120 && step.active; index += 1) {
    state = step;
    step = stepSnakeMotion(state, 320);
  }
  assert.equal(step.active, false);
  assert.ok(Math.abs(step.velocity) <= snakeMotionEpsilon);
  assert.ok(Math.abs(step.targetVelocity) <= snakeMotionEpsilon);
});

test("route feedback accepts only unmodified same-origin route changes", () => {
  const base = {
    altKey: false,
    button: 0,
    ctrlKey: false,
    currentHref: "https://thedomain.example/events",
    download: false,
    href: "https://thedomain.example/gallery",
    metaKey: false,
    shiftKey: false,
    target: null,
  };
  assert.equal(shouldStartNavigationTransition(base), true);
  assert.equal(
    shouldStartNavigationTransition({ ...base, href: "https://thedomain.example/events#top" }),
    false,
  );
  assert.equal(
    shouldStartNavigationTransition({ ...base, href: "https://external.example/gallery" }),
    false,
  );
  assert.equal(shouldStartNavigationTransition({ ...base, button: 1 }), false);
  assert.equal(shouldStartNavigationTransition({ ...base, ctrlKey: true }), false);
  assert.equal(shouldStartNavigationTransition({ ...base, metaKey: true }), false);
  assert.equal(shouldStartNavigationTransition({ ...base, target: "_blank" }), false);
  assert.equal(shouldStartNavigationTransition({ ...base, download: true }), false);
  assert.equal(
    shouldStartNavigationTransition({ ...base, href: "mailto:hello@example.com" }),
    false,
  );
});
