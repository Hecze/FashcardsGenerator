from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from langchain_openai import ChatOpenAI
from mangum import Mangum

app = FastAPI()

# Configura el modelo de LangChain
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0, api_key="secret_api_key")

# Modelo de datos para el endpoint POST
class FlashcardRequest(BaseModel):
    description: str

# Endpoint para generar el contenido de flashcards
@app.post("/")
async def generate_flashcards(request: FlashcardRequest):
    description = request.description

    if not description:
        raise HTTPException(status_code=400, detail="Descripción no proporcionada")

    # Genera el contenido de las flashcards usando LangChain
    prompt = f'Ve directo al grano sin introduccion ni enumeracion. Genera una lista entre términos y definiciones muy cortas sobre {description}. la lista tiene que estar separada por punto y coma. Por ejemplo: "Python: Lenguaje de programación; FastAPI: Framework de Python"'
    response = llm(prompt)
    response_content = response.content.replace('\n', '')
    flashcards = response_content.split(';')

    # Devuelve la lista de flashcards como un JSON
    flashcards_data = [{"question": fc.split(':')[0].strip(), "answer": fc.split(':')[1].strip()} for fc in flashcards if ':' in fc]

    return {"flashcards": flashcards_data}

# GET de prueba para probar la API
@app.get("/")
async def root():
    return {"message": "Hello World from FastApi"}

# Adaptador para AWS Lambda
handler = Mangum(app)
