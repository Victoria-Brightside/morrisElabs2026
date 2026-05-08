# Laboratorio: Asistente Serverless RAG con Amazon Bedrock

En este laboratorio se te proporcionará un entorno en el cual tu objetivo es construir un **asistente conversacional serverless** utilizando Amazon Bedrock: crearás una Knowledge Base conectada a S3 Vectors que indexará documentos, configurarás un Guardrail de seguridad, desplegarás una función Lambda que orquesta la búsqueda de contexto y la generación de respuestas con el modelo **Amazon Nova Lite**, y expondrás todo a través de Amazon API Gateway conectado a una página web estática alojada en S3.

![Arquitectura del laboratorio](https://raw.githubusercontent.com/Victoria-Brightside/img-labs-morris/refs/heads/main/aiengineer/bedrockarch.png)

---

## 📋 Índice

1. [Fase 1 — Amazon S3](#fase-1--amazon-s3)
2. [Fase 2 — Bedrock: Knowledge Base](#fase-2--bedrock-knowledge-base-con-s3-vectors)
3. [Fase 3 — Bedrock: Guardrail](#fase-3--bedrock-guardrail)
4. [Fase 4 — AWS Lambda](#fase-4--aws-lambda)
5. [Fase 5 — Amazon API Gateway](#fase-5--amazon-api-gateway)

---

## Fase 1 — Amazon S3

### 1.1 Bucket de documentos (RAG)

Este bucket almacenará los documentos que la Knowledge Base indexará para responder preguntas.

1. Ve a **S3 → Create bucket**
2. **Bucket namespace:** Selecciona *Global Namespace*
3. **Bucket name:** Elige un nombre único que empiece con `rag-xxxxx`
4. **Block all public access:** ✅ Activado
5. Deja el resto de configuraciones por defecto
6. Haz clic en **Create bucket**
7. Abre el bucket → **Upload** → sube el archivo `info_test_RAG.pdf`

---

### 1.2 Bucket del frontend

Este bucket almacenará los archivos de la interfaz web. El acceso se realizará directamente a través de la URL de la API Gateway.

1. Ve a **S3 → Create bucket**
2. **Bucket namespace:** Selecciona *Global Namespace*
3. **Bucket name:** Elige un nombre único
4. **Block all public access:** ✅ Activado
5. Deja el resto de configuraciones por defecto
6. Haz clic en **Create bucket**
7. Sube los archivos `index.html` e `index.css`

---

## Fase 2 — Bedrock: Knowledge Base con S3 Vectors

### 2.1 Crear la Knowledge Base

1. Ve a **Amazon Bedrock → Knowledge bases → Create knowledge base**
2. **Knowledge base name:** `knowledge-base-lab`
3. **IAM permissions:** *Create and use a new service role*
4. Haz clic en **Next**

---

### 2.2 Elegir el tipo de Data Source

1. **Data source type:** Amazon S3
2. Haz clic en **Next**

---

### 2.3 Configurar el Data Source

| Campo | Valor |
|---|---|
| Data source name | Dejar nombre por defecto |
| Data source location | This account |
| S3 URI | Click *Browse S3* → seleccionar bucket `rag-xxxxx` |
| Parsing strategy | Amazon Bedrock default parser |
| Chunking strategy | Default chunking |

---

### 2.4 Configurar Data Storage and Processing

| Campo | Valor |
|---|---|
| Embeddings model | Titan Embeddings V2 (1026 dimensions) |
| Vector store | Quick create a new vector store |
| Vector store type | Amazon S3 Vectors |

1. Haz clic en **Next → Create knowledge base**
2. Espera hasta que el estado sea **Ready** *(2–5 minutos)*

> 📝 **Anota el Knowledge Base ID** — tiene el formato `XXXXXXXXXX`

---

### 2.5 Sincronizar documentos

1. Dentro de la Knowledge Base → pestaña **Data source**
2. Selecciona `knowledge-base` → haz clic en **Sync**
3. Espera hasta que el estado diga **Available**

---

## Fase 3 — Bedrock: Guardrail

### 3.1 Crear el Guardrail

1. Ve a **Amazon Bedrock → Guardrails → Create guardrail**
2. **Name:** `Lab-chatbot-filter`
3. **Description:** `Filtro de seguridad para chatbot`
4. **Messaging for blocked prompts:** `Disculpa, no puedo responder esta pregunta.`
5. Selecciona ✅ *Apply the same blocked message for responses*
6. Haz clic en **Next**

---

### 3.2 Configurar Content Filters

Ve a **Content filters → Configure harmful categories** y aplica la siguiente configuración a **cada categoría** (Hate, Insults, Sexual, Violence, Misconduct):

| Campo | Valor |
|---|---|
| Enable | ✅ Text |
| Guardrail action | Block |
| Set threshold | High |

Haz clic en **Next**.

---

### 3.3 Denied Topics

1. Haz clic en **Add denied topic** y configura:

| Campo | Valor |
|---|---|
| Name | `Fútbol` |
| Definition | *El fútbol abarca consultas sobre partidos, jugadores, equipos, ligas, torneos, resultados, transferencias o cualquier contenido relacionado con este deporte.* |
| Input | ✅ Enable → Block |
| Output | ✅ Enable → Block |

2. **Denied topics tier:** Selecciona *Classic*
3. Selecciona **Skip to Review and Create**
4. Haz clic en **Create guardrail**

> 📝 **Anota el Guardrail ID** — formato `xxxxxxxxxx`  
> 📝 **Anota el número de versión** en la columna *Version* (normalmente `1`)

---

## Fase 4 — AWS Lambda

### 4.1 Crear la función

1. Ve a **AWS Lambda → Create function**
2. Selecciona **Author from scratch**

| Campo | Valor |
|---|---|
| Function name | `myLabFunction` |
| Runtime | Python 3.12 |
| Architecture | x86_64 |

3. Haz clic en **Create function**

---

### 4.2 Pegar el código

1. Ve a la pestaña **Code** → abre `lambda_function.py`
2. Borra todo el contenido y pega el código proporcionado
3. Haz clic en **Deploy**

---

### 4.3 Variables de entorno

Ve a **Configuration → Environment variables → Edit → Add environment variable** y agrega:

| Key | Value |
|---|---|
| `KB_ID` | ID de tu Knowledge Base |
| `GUARDRAIL_ID` | ID del Guardrail |
| `GUARDRAIL_VERSION` | `1` |

Haz clic en **Save**.

---

### 4.4 Timeout, memoria y rol de ejecución

Ve a **Configuration → General configuration → Edit** y configura:

| Campo | Valor |
|---|---|
| Memory | 256 MB |
| Timeout | 30 segundos |
| Execution Role | `lab-bedrock-role-for-lambda` |

Haz clic en **Save**.

---

## Fase 5 — Amazon API Gateway

### 5.1 Crear la API

1. Ve a **API Gateway → Create API**
2. Tipo: **REST API** → haz clic en **Build**

| Campo | Valor |
|---|---|
| API name | `myLabAPI` |
| Endpoint type | Regional |

3. Haz clic en **Create API**

---

### 5.2 Crear el recurso `/chat`

1. En el árbol de recursos → **Actions → Create Resource**

| Campo | Valor |
|---|---|
| Resource name | `chat` |
| Resource path | `/chat` |
| Enable API Gateway CORS | ✅ |

2. Haz clic en **Create Resource**

---

### 5.3 Crear el método POST

1. Con `/chat` seleccionado → **Create Method → POST** → ✅

| Campo | Valor |
|---|---|
| Integration type | Lambda Function |
| Use Lambda Proxy integration | ✅ |
| Lambda Function | Nombre de tu función Lambda |

2. Deja el resto por defecto y haz clic en **Create method**

---

### 5.4 Habilitar CORS

Con `/chat` seleccionado → haz clic en **Enable CORS** y configura:

| Campo | Valor |
|---|---|
| Gateway responses | ✅ Default 4XX / ✅ Default 5XX |
| Allow-Methods | ✅ OPTIONS / ✅ POST |
| Allow-Headers | `Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token` |
| Allow-Origin | `*` |

Haz clic en **Save**.

---

### 5.5 Deploy

1. **Actions → Deploy API**

| Campo | Valor |
|---|---|
| Deployment stage | [New Stage] |
| Stage name | `prod` |

2. Haz clic en **Deploy**

> ✅ **Copia la Invoke URL:**  
> `https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod`  
> ⚠️ Guarda esta URL — es el punto de entrada al asistente desde el frontend.

---

## 🎉 ¡Felicidades!

Has completado el laboratorio. Tu asistente serverless RAG está desplegado y listo para responder preguntas sobre los documentos indexados en tu Knowledge Base, con filtros de seguridad activos a través del Guardrail de Bedrock.
