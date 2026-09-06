"""Report evaluation readiness without manufacturing prototype metrics."""

import argparse
import json
from pathlib import Path


def evaluate(dataset: Path | None) -> dict:
    if dataset is None or not dataset.exists():
        return {"evaluated": False, "reason": "No labelled dataset was supplied; metrics are intentionally withheld."}
    return {"evaluated": False, "reason": "Dataset inspection and label-quality review are required before metrics are reported.", "dataset": str(dataset)}


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--dataset", type=Path)
    print(json.dumps(evaluate(parser.parse_args().dataset), indent=2))
