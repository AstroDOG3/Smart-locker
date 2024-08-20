from fastapi import FastAPI

app = FastAPI()

#uvicorn main:app --reload
@app.get("/hi")
def index():
    return {"message": "Hello world"}