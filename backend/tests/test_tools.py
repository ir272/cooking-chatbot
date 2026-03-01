from app.tools.cookware import AVAILABLE_COOKWARE, check_cookware


def test_all_cookware_available():
    result = check_cookware.invoke({"required_cookware": ["Knife", "Spatula"]})
    assert "All required cookware" in result


def test_missing_cookware():
    result = check_cookware.invoke({"required_cookware": ["Knife", "Oven", "Blender"]})
    assert "Missing" in result
    assert "Oven" in result
    assert "Blender" in result


def test_case_insensitive():
    result = check_cookware.invoke({"required_cookware": ["KNIFE", "frying pan"]})
    assert "All required cookware" in result


def test_empty_list():
    result = check_cookware.invoke({"required_cookware": []})
    assert "All required cookware" in result or "available" in result.lower()


def test_all_items_accounted_for():
    result = check_cookware.invoke({"required_cookware": ["Knife", "Oven"]})
    assert "Knife" in result
    assert "Oven" in result


def test_all_available_cookware_recognized():
    result = check_cookware.invoke({"required_cookware": AVAILABLE_COOKWARE})
    assert "All required cookware" in result
