from langchain_core.tools import tool

AVAILABLE_COOKWARE = [
    "Spatula",
    "Frying Pan",
    "Little Pot",
    "Stovetop",
    "Whisk",
    "Knife",
    "Ladle",
    "Spoon",
]


@tool
def check_cookware(required_cookware: list[str]) -> str:
    """Check which items from the required cookware list are available in the user's kitchen.
    Call this tool when providing a recipe to verify the user has necessary equipment.

    Args:
        required_cookware: List of cookware items needed for the recipe.
    """
    available_lower = {item.lower() for item in AVAILABLE_COOKWARE}

    found = []
    missing = []

    for item in required_cookware:
        if item.lower() in available_lower:
            found.append(item)
        else:
            missing.append(item)

    if not missing:
        return f"All required cookware is available: {', '.join(found)}. Proceed with the recipe."

    result = f"Available: {', '.join(found) if found else 'None of the requested items'}.\n"
    result += f"Missing: {', '.join(missing)}.\n"
    result += "Please suggest recipe modifications using only the available equipment: "
    result += ", ".join(AVAILABLE_COOKWARE)
    return result
