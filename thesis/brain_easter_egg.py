"""
mini_brain.py

A tiny educational brain simulation.

Run:
    python mini_brain.py

Core idea:
    perception  = weighted inference from noisy sensory input
    action      = motor choice from neural activity
    learning    = change synapses using reward prediction error
    memory      = persistent traces of past activity
    homeostasis = keep activity within a usable range
"""

from __future__ import annotations

import math
import random
from dataclasses import dataclass, field


def sigmoid(x: float) -> float:
    return 1.0 / (1.0 + math.exp(-x))


def dot(a: list[float], b: list[float]) -> float:
    return sum(x * y for x, y in zip(a, b))


def softmax(xs: list[float]) -> list[float]:
    m = max(xs)
    exps = [math.exp(x - m) for x in xs]
    total = sum(exps)
    return [x / total for x in exps]


def sample(probs: list[float]) -> int:
    r = random.random()
    c = 0.0
    for i, p in enumerate(probs):
        c += p
        if r <= c:
            return i
    return len(probs) - 1


@dataclass
class World:
    """
    A tiny world with two hidden states.

    state 0 = food is on the left
    state 1 = food is on the right
    """

    state: int = 0

    def reset(self) -> None:
        self.state = random.choice([0, 1])

    def observe(self) -> list[float]:
        """
        Return noisy sensory evidence.

        If food is left, left sensor tends to be high.
        If food is right, right sensor tends to be high.
        """
        noise = 0.25

        if self.state == 0:
            return [
                random.gauss(1.0, noise),
                random.gauss(0.0, noise),
            ]

        return [
            random.gauss(0.0, noise),
            random.gauss(1.0, noise),
        ]

    def reward(self, action: int) -> float:
        """
        action 0 = go left
        action 1 = go right
        """
        return 1.0 if action == self.state else -1.0


@dataclass
class Neuron:
    bias: float = 0.0
    activity: float = 0.0
    target_activity: float = 0.25

    def fire(self, x: float) -> float:
        self.activity = sigmoid(x + self.bias)
        return self.activity

    def homeostasis(self, rate: float = 0.01) -> None:
        """
        If neuron is too active, lower its bias.
        If neuron is too silent, raise its bias.
        """
        error = self.activity - self.target_activity
        self.bias -= rate * error


@dataclass
class SynapseMatrix:
    rows: int
    cols: int
    weights: list[list[float]] = field(default_factory=list)

    def __post_init__(self) -> None:
        if not self.weights:
            self.weights = [
                [random.gauss(0.0, 0.5) for _ in range(self.cols)]
                for _ in range(self.rows)
            ]

    def forward(self, x: list[float]) -> list[float]:
        return [dot(row, x) for row in self.weights]

    def hebbian_update(
        self,
        pre: list[float],
        post: list[float],
        reward_error: float,
        lr: float = 0.05,
    ) -> None:
        """
        Cells that fire together wire together,
        but gated by reward prediction error.

        Positive error strengthens useful correlations.
        Negative error weakens them.
        """
        for i in range(self.rows):
            for j in range(self.cols):
                self.weights[i][j] += lr * reward_error * post[i] * pre[j]


@dataclass
class ShortTermMemory:
    size: int
    trace: list[float] = field(default_factory=list)

    def __post_init__(self) -> None:
        if not self.trace:
            self.trace = [0.0 for _ in range(self.size)]

    def update(self, activity: list[float], decay: float = 0.85) -> list[float]:
        """
        Memory is not magic.
        It is activity that has not fully decayed yet.
        """
        self.trace = [
            decay * old + (1.0 - decay) * new
            for old, new in zip(self.trace, activity)
        ]
        return self.trace


@dataclass
class Brain:
    """
    Tiny nervous system:

    sensors -> cortex -> basal ganglia/action system -> world

    reward prediction error changes synapses.
    memory keeps a trace.
    homeostasis keeps neurons from saturating.
    """

    n_sensors: int = 2
    n_cortex: int = 6
    n_actions: int = 2

    cortex: list[Neuron] = field(default_factory=list)
    sensory_to_cortex: SynapseMatrix | None = None
    cortex_to_action: SynapseMatrix | None = None
    memory: ShortTermMemory | None = None

    expected_reward: float = 0.0

    def __post_init__(self) -> None:
        self.cortex = [
            Neuron(bias=random.gauss(-1.0, 0.2))
            for _ in range(self.n_cortex)
        ]

        self.sensory_to_cortex = SynapseMatrix(
            rows=self.n_cortex,
            cols=self.n_sensors,
        )

        self.cortex_to_action = SynapseMatrix(
            rows=self.n_actions,
            cols=self.n_cortex,
        )

        self.memory = ShortTermMemory(size=self.n_cortex)

    def perceive(self, sensors: list[float]) -> list[float]:
        """
        Convert sensory input into cortical activity.
        """
        assert self.sensory_to_cortex is not None

        drive = self.sensory_to_cortex.forward(sensors)

        activity = [
            neuron.fire(x)
            for neuron, x in zip(self.cortex, drive)
        ]

        return activity

    def think_with_memory(self, activity: list[float]) -> list[float]:
        """
        Blend current activity with short-term memory.
        """
        assert self.memory is not None

        trace = self.memory.update(activity)

        return [
            0.7 * now + 0.3 * past
            for now, past in zip(activity, trace)
        ]

    def choose_action(self, activity: list[float]) -> tuple[int, list[float]]:
        """
        Convert cortical activity into action probabilities.
        """
        assert self.cortex_to_action is not None

        logits = self.cortex_to_action.forward(activity)
        probs = softmax(logits)
        action = sample(probs)

        return action, probs

    def learn(
        self,
        sensors: list[float],
        cortical_activity: list[float],
        action: int,
        reward: float,
    ) -> float:
        """
        Dopamine-like learning signal:

            prediction error = received reward - expected reward

        This gates plasticity.
        """
        assert self.sensory_to_cortex is not None
        assert self.cortex_to_action is not None

        reward_error = reward - self.expected_reward

        self.expected_reward += 0.05 * reward_error

        action_activity = [
            1.0 if i == action else 0.0
            for i in range(self.n_actions)
        ]

        self.sensory_to_cortex.hebbian_update(
            pre=sensors,
            post=cortical_activity,
            reward_error=reward_error,
            lr=0.01,
        )

        self.cortex_to_action.hebbian_update(
            pre=cortical_activity,
            post=action_activity,
            reward_error=reward_error,
            lr=0.05,
        )

        for neuron in self.cortex:
            neuron.homeostasis()

        return reward_error

    def step(self, world: World) -> dict:
        sensors = world.observe()

        cortical = self.perceive(sensors)
        mixed = self.think_with_memory(cortical)

        action, probs = self.choose_action(mixed)
        reward = world.reward(action)

        rpe = self.learn(
            sensors=sensors,
            cortical_activity=mixed,
            action=action,
            reward=reward,
        )

        return {
            "state": world.state,
            "sensors": sensors,
            "cortex": mixed,
            "action": action,
            "probs": probs,
            "reward": reward,
            "rpe": rpe,
            "expected_reward": self.expected_reward,
        }


def summarize_activity(xs: list[float]) -> str:
    return "[" + ", ".join(f"{x:.2f}" for x in xs[:4]) + ", ...]"


def main() -> None:
    random.seed(4)

    world = World()
    brain = Brain()

    total_reward = 0.0

    for trial in range(1, 101):
        world.reset()
        result = brain.step(world)

        total_reward += result["reward"]

        if trial <= 10 or trial % 10 == 0:
            state_name = "left" if result["state"] == 0 else "right"
            action_name = "left" if result["action"] == 0 else "right"

            print(f"\ntrial {trial}")
            print(f"world: food is {state_name}")
            print(f"sensors: {summarize_activity(result['sensors'])}")
            print(f"cortex:  {summarize_activity(result['cortex'])}")
            print(
                "action probabilities: "
                f"left={result['probs'][0]:.2f}, "
                f"right={result['probs'][1]:.2f}"
            )
            print(f"chosen action: {action_name}")
            print(f"reward: {result['reward']:+.1f}")
            print(f"reward prediction error: {result['rpe']:+.2f}")
            print(f"running total reward: {total_reward:+.1f}")

    print("\nFinal expected reward:")
    print(f"{brain.expected_reward:.3f}")


if __name__ == "__main__":
    main()