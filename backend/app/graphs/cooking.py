from typing import Annotated, Literal

from langchain_core.messages import AIMessage, AnyMessage, HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import END, StateGraph
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode, tools_condition
from typing_extensions import TypedDict

from app.config import settings
from app.prompts.system import CLASSIFICATION_PROMPT, COOKING_SYSTEM_PROMPT, REJECTION_MESSAGE
from app.tools import check_cookware, get_search_tools


class CookingState(TypedDict):
    messages: Annotated[list[AnyMessage], add_messages]
    query_type: str


def build_graph():
    """Build and compile the cooking chatbot LangGraph."""
    llm = ChatOpenAI(
        model=settings.model_name,
        temperature=settings.model_temperature,
        api_key=settings.openai_api_key,
    )

    search_tools = get_search_tools()
    all_tools = [check_cookware] + search_tools
    llm_with_tools = llm.bind_tools(all_tools)

    # --- Node functions ---

    def classify_query(state: CookingState) -> dict:
        """Classify whether the query is cooking-related or off-topic."""
        last_message = state["messages"][-1]
        response = llm.invoke([
            SystemMessage(content=CLASSIFICATION_PROMPT),
            HumanMessage(content=last_message.content),
        ])
        query_type = response.content.strip().lower()
        if query_type not in ("cooking", "off_topic"):
            query_type = "cooking"
        return {"query_type": query_type}

    def reject_query(state: CookingState) -> dict:
        """Reject off-topic queries with a helpful message."""
        return {"messages": [AIMessage(content=REJECTION_MESSAGE)]}

    def agent(state: CookingState) -> dict:
        """Main agent node — calls LLM with tools."""
        system = SystemMessage(content=COOKING_SYSTEM_PROMPT)
        messages = [system] + state["messages"]
        response = llm_with_tools.invoke(messages)
        return {"messages": [response]}

    def route_by_type(state: CookingState) -> Literal["agent", "reject"]:
        """Route based on query classification."""
        if state["query_type"] == "off_topic":
            return "reject"
        return "agent"

    # --- Build graph ---

    graph = StateGraph(CookingState)

    graph.add_node("classify", classify_query)
    graph.add_node("reject", reject_query)
    graph.add_node("agent", agent)
    graph.add_node("tools", ToolNode(all_tools))

    graph.set_entry_point("classify")
    graph.add_conditional_edges("classify", route_by_type)
    graph.add_conditional_edges("agent", tools_condition)
    graph.add_edge("tools", "agent")
    graph.add_edge("reject", END)

    memory = MemorySaver()
    return graph.compile(checkpointer=memory)
