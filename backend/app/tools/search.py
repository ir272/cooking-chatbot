from langchain_community.tools import DuckDuckGoSearchResults
from langchain_community.utilities import DuckDuckGoSearchAPIWrapper

from app.config import settings


def get_search_tools() -> list:
    """Build list of available search tools based on configured API keys.

    Uses Tavily if API key is set, otherwise falls back to DuckDuckGo.
    """
    if settings.tavily_api_key:
        from langchain_community.tools import TavilySearchResults

        return [
            TavilySearchResults(
                max_results=3,
                tavily_api_key=settings.tavily_api_key,
                description=(
                    "Search the web for cooking recipes and food information. "
                    "Use this for finding specific recipes, cooking techniques, "
                    "or ingredient information."
                ),
            )
        ]

    wrapper = DuckDuckGoSearchAPIWrapper(max_results=3)
    return [
        DuckDuckGoSearchResults(
            api_wrapper=wrapper,
            description=(
                "Search the web for cooking recipes and food information. "
                "Use this for finding specific recipes, cooking techniques, "
                "or ingredient information."
            ),
        )
    ]
