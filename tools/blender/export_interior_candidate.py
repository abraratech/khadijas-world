"""Export the currently opened Quaternius Blend file to one optimized GLB.

Run through Blender, not normal Python. The PowerShell wrapper passes OUTPUT_GLB.
This source-side helper is optional and is not used by the browser build.
"""

from __future__ import annotations

import os
from pathlib import Path

import bpy


def prepare_legacy_materials() -> None:
    """Copy old diffuse colors into Principled BSDF nodes for glTF export.

    The Quaternius source files use legacy material diffuse colors. Blender's
    glTF exporter can otherwise emit material names without baseColorFactor,
    which makes every surface render white in Babylon.js.
    """

    for material in bpy.data.materials:
        diffuse = tuple(material.diffuse_color)
        material.use_nodes = True
        nodes = material.node_tree.nodes if material.node_tree else None
        if nodes is None:
            continue
        principled = next(
            (node for node in nodes if node.type == "BSDF_PRINCIPLED"),
            None,
        )
        if principled is None:
            continue
        base_color = principled.inputs.get("Base Color")
        if base_color is not None:
            base_color.default_value = diffuse
        roughness = principled.inputs.get("Roughness")
        if roughness is not None and material.name.lower() not in {"glass", "lightmetal", "darkmetal", "metal"}:
            roughness.default_value = 0.58
        metallic = principled.inputs.get("Metallic")
        if metallic is not None and "metal" in material.name.lower():
            metallic.default_value = 0.55


def main() -> None:
    output = os.environ.get("OUTPUT_GLB")
    if not output:
        raise RuntimeError("OUTPUT_GLB was not provided")

    output_path = Path(output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    if output_path.exists():
        output_path.unlink()

    bpy.ops.object.select_all(action="DESELECT")
    mesh_objects = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]
    for obj in mesh_objects:
        obj.hide_viewport = False
        obj.hide_render = False
        obj.select_set(True)

    if not mesh_objects:
        raise RuntimeError("No mesh objects found in the Blend file")

    prepare_legacy_materials()
    bpy.context.view_layer.objects.active = mesh_objects[0]
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    bpy.ops.export_scene.gltf(
        filepath=str(output_path),
        export_format="GLB",
        use_selection=True,
        export_apply=True,
        export_yup=True,
        export_materials="EXPORT",
        export_cameras=False,
        export_lights=False,
        export_animations=False,
    )
    if not output_path.exists() or output_path.stat().st_size < 12:
        raise RuntimeError(f"Blender did not create a valid GLB at {output_path}")
    print(f"Exported {len(mesh_objects)} mesh objects to {output_path}")


if __name__ == "__main__":
    main()
