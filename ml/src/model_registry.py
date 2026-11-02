"""
Model Version Registry for Forkora Career Recommendation ML Pipeline.
Manages versioned model artifacts (v1, v2, ...), tracks dataset provenance and metrics,
and supports active version activation and rollback without deleting historical versions.
"""
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional, Union
import argparse
import json
import sys

from src.config import MODELS_DIR, REGISTRY_PATH


class ModelRegistry:
    """Persistent registry tracking versioned ML pipelines."""

    def __init__(self, registry_path: Union[str, Path] = REGISTRY_PATH, models_dir: Union[str, Path] = MODELS_DIR):
        self.registry_path = Path(registry_path)
        self.models_dir = Path(models_dir)
        self.models_dir.mkdir(parents=True, exist_ok=True)
        self._ensure_registry_exists()

    def _ensure_registry_exists(self) -> None:
        """Create empty registry file if missing."""
        if not self.registry_path.exists():
            data = {
                "active_version": None,
                "history": [],
                "versions": {},
            }
            self._save(data)

    def _load(self) -> Dict[str, Any]:
        """Load registry JSON."""
        with open(self.registry_path, "r", encoding="utf-8") as f:
            return json.load(f)

    def _save(self, data: Dict[str, Any]) -> None:
        """Save registry JSON safely."""
        with open(self.registry_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)

    def get_next_version(self) -> str:
        """
        Determine the next version identifier (e.g. v1, v2, v3) without overwriting existing.
        """
        data = self._load()
        existing_versions = list(data.get("versions", {}).keys())
        v_nums = []
        for v in existing_versions:
            if v.startswith("v") and v[1:].isdigit():
                v_nums.append(int(v[1:]))

        # Also inspect directory folders on disk in case folders were created manually
        for folder in self.models_dir.iterdir():
            if folder.is_dir() and folder.name.startswith("v") and folder.name[1:].isdigit():
                v_nums.append(int(folder.name[1:]))

        next_num = max(v_nums, default=0) + 1
        return f"v{next_num}"

    def register_version(
        self,
        version: str,
        dataset_type: str,
        dataset_path: str,
        artifact_path: str,
        algorithm: str,
        metrics: Dict[str, Any],
        set_active: bool = False,
    ) -> Dict[str, Any]:
        """
        Register a newly trained model version into the registry.
        """
        data = self._load()
        now_iso = datetime.now().isoformat()

        entry = {
            "version": version,
            "dataset_type": dataset_type,
            "dataset_path": str(dataset_path),
            "artifact_path": str(artifact_path),
            "algorithm": algorithm,
            "created_at": now_iso,
            "metrics": {
                "accuracy": metrics.get("accuracy"),
                "macro_f1": metrics.get("macro_f1"),
                "weighted_f1": metrics.get("weighted_f1"),
                "macro_precision": metrics.get("macro_precision"),
                "macro_recall": metrics.get("macro_recall"),
            },
            "is_active": set_active,
        }

        data["versions"][version] = entry

        if set_active or data.get("active_version") is None:
            prev_active = data.get("active_version")
            if prev_active and prev_active in data["versions"]:
                data["versions"][prev_active]["is_active"] = False
            data["active_version"] = version
            entry["is_active"] = True
            data["history"].append({
                "action": "activate",
                "version": version,
                "timestamp": now_iso,
                "reason": "Initial activation upon registration" if prev_active is None else "Promoted upon registration",
            })

        self._save(data)
        return entry

    def list_versions(self) -> List[Dict[str, Any]]:
        """List all registered versions with status and metrics."""
        data = self._load()
        versions = list(data.get("versions", {}).values())
        return sorted(versions, key=lambda x: x["version"])

    def get_version_info(self, version: str) -> Optional[Dict[str, Any]]:
        """Retrieve registry entry for a specific version."""
        data = self._load()
        return data.get("versions", {}).get(version)

    def get_active_version(self) -> Optional[str]:
        """Get the current active model version."""
        data = self._load()
        return data.get("active_version")

    def get_active_artifact_path(self) -> Optional[Path]:
        """Get the file path to the active model pipeline artifact."""
        active_v = self.get_active_version()
        if not active_v:
            return None
        info = self.get_version_info(active_v)
        if info and "artifact_path" in info:
            p = Path(info["artifact_path"])
            if not p.is_absolute():
                p = self.models_dir.parent / p
            return p
        # Default convention
        candidate = self.models_dir / active_v / "career_pipeline.joblib"
        return candidate if candidate.exists() else None

    def set_active_version(self, version: str, reason: str = "Manual activation") -> bool:
        """
        Explicitly activate a specific model version after evaluation.
        """
        data = self._load()
        if version not in data.get("versions", {}):
            raise KeyError(f"Version '{version}' is not registered. Available: {list(data.get('versions', {}).keys())}")

        now_iso = datetime.now().isoformat()
        for v, info in data["versions"].items():
            info["is_active"] = (v == version)

        data["active_version"] = version
        data["history"].append({
            "action": "set_active",
            "version": version,
            "timestamp": now_iso,
            "reason": reason,
        })
        self._save(data)
        return True

    def rollback(self, target_version: Optional[str] = None) -> str:
        """
        Roll back active model to the previously active version or specified version.
        """
        data = self._load()
        current = data.get("active_version")

        if target_version:
            if target_version not in data.get("versions", {}):
                raise KeyError(f"Target version '{target_version}' does not exist.")
            self.set_active_version(target_version, reason=f"Rollback from {current} to {target_version}")
            return target_version

        # Search history for previous active version
        history = data.get("history", [])
        candidates = [h["version"] for h in reversed(history) if h["version"] != current]
        if not candidates:
            # Fallback: Pick highest version that is not current
            all_v = sorted([v for v in data["versions"].keys() if v != current])
            if not all_v:
                raise ValueError("No alternative version available to rollback to.")
            rollback_v = all_v[-1]
        else:
            rollback_v = candidates[0]

        self.set_active_version(rollback_v, reason=f"Rollback from {current} to {rollback_v}")
        return rollback_v


# CLI Entrypoint for Model Version Management
def main():
    parser = argparse.ArgumentParser(description="Forkora Model Registry Management CLI")
    subparsers = parser.add_subparsers(dest="command", help="Registry command to execute")

    # List command
    subparsers.add_parser("list", help="List all registered model versions")

    # Info command
    info_p = subparsers.add_parser("info", help="Get metadata of a specific version")
    info_p.add_argument("version", type=str, help="Version string (e.g. v1)")

    # Set active command
    set_p = subparsers.add_parser("set-active", help="Set active model version")
    set_p.add_argument("version", type=str, help="Version string (e.g. v1)")

    # Rollback command
    rb_p = subparsers.add_parser("rollback", help="Roll back to previous or specified version")
    rb_p.add_argument("--version", type=str, default=None, help="Optional specific version to rollback to")

    args = parser.parse_args()
    registry = ModelRegistry()

    if args.command == "list":
        versions = registry.list_versions()
        active = registry.get_active_version()
        print("\n" + "=" * 80)
        print("FORKORA MODEL REGISTRY")
        print("=" * 80)
        if not versions:
            print("No models registered yet.")
        else:
            print(f"{'Version':<10} {'Status':<10} {'Type':<12} {'Algorithm':<25} {'Macro F1':<10} {'Accuracy':<10}")
            print("-" * 80)
            for v in versions:
                status = "ACTIVE *" if v["version"] == active else "inactive"
                acc = f"{v['metrics'].get('accuracy', 0.0):.4f}" if v.get("metrics") else "N/A"
                f1 = f"{v['metrics'].get('macro_f1', 0.0):.4f}" if v.get("metrics") else "N/A"
                print(f"{v['version']:<10} {status:<10} {v['dataset_type']:<12} {v['algorithm'][:24]:<25} {f1:<10} {acc:<10}")
        print("=" * 80 + "\n")

    elif args.command == "info":
        info = registry.get_version_info(args.version)
        if not info:
            print(f"Error: Version '{args.version}' not found.")
            sys.exit(1)
        print(json.dumps(info, indent=2))

    elif args.command == "set-active":
        registry.set_active_version(args.version, reason="CLI promotion")
        print(f"Successfully activated model version: {args.version}")

    elif args.command == "rollback":
        new_active = registry.rollback(args.version)
        print(f"Successfully rolled back active model to: {new_active}")

    else:
        parser.print_help()


if __name__ == "__main__":
    main()
