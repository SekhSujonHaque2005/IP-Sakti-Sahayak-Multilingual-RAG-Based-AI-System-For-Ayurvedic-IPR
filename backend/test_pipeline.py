import asyncio
from ml_engine.pipeline import handle_query

def main():
    result = handle_query("Tell me About Ayurvedic Regulations")
    print(result)

if __name__ == "__main__":
    main()
