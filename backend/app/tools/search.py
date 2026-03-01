from langchain_community.tools import DuckDuckGoSearchResults
from langchain_community.utilities import DuckDuckGoSearchAPIWrapper

from app.config import settings


def get_search_tools() -> list:
    """Build list of available search tools based on configured API keys."""
    tools = []

    if settings.tavily_api_key:
        from langchain_community.tools import TavilySearchResults

        tools.append(
            TavilySearchResults(
                max_results=3,
                description=(
                    "Search the web for cooking recipes and food information. "
                    "Use this for finding specific recipes, cooking techniques, "
                    "or ingredient information."
                ),
            )
        )

    wrapper = DuckDuckGoSearchAPIWrapper(max_results=3)
    tools.append(
        DuckDuckGoSearchResults(
            api_wrapper=wrapper,
            description=(
                "Search the web using DuckDuckGo for cooking recipes and food information. "
                "Use as a fallback or additional search source."
            ),
        )
    )

    return tools
