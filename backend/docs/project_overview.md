# VaidyaSetu: Project Overview & Approach

> **IP-SAKTI Sahayak** — A Multilingual, Retrieval-Augmented, Source-Cited AI Assistant for Ayurveda Intellectual Property and Regulatory Guidance.

---

## 1. The Problem We Chose

**Problem Statement ID:** SIH26045 (Ministry of Ayush / All India Institute of Ayurveda)

**In Simple Words:** 
Ayurveda relies on a vast amount of traditional knowledge. However, turning an Ayurvedic remedy into a commercial product involves navigating a massive maze of overlapping legal systems. Innovators have to deal with:
- **Intellectual Property (IP):** Patents, Trademarks, Geographical Indications (GI), and Copyrights.
- **Biological Resources:** Access-and-Benefit-Sharing (ABS) duties because India legally owns its biological resources.
- **Drug Regulations:** Categorizing a product as a classical medicine, a proprietary medicine, a new drug, a cosmetic, or food.

Because this is so complex, genuine Ayurvedic innovators struggle to protect and commercialize their work in India, while foreign entities often misappropriate and patent this traditional knowledge abroad. The Ministry of Ayush needs an AI assistant to help innovators navigate these patents and regulations safely, in multiple languages, and with exact citations to the law.

---

## 2. Why We Chose This Problem

We selected this problem statement based on three key factors:

1. **High Feasibility:** Our team has the exact mix of Machine Learning and Backend skills required to build a sophisticated Retrieval-Augmented Generation (RAG) system, complete with citation verification and legal logic.
2. **Clear Market Need:** Recent changes in the law (like the 2024 Patents Rules and the amended Biodiversity Act) make trustworthy, plain-language guidance more critical than ever. The Ministry has a genuine, ongoing need for this tool.
3. **Strategic Advantage:** Building a strict, legally grounded AI requires more than just a basic chatbot wrapper, which filters out teams lacking deep ML engineering skills.

---

## 3. Existing Solutions and Their Limitations

Currently, there is no unified solution for Ayurveda innovators. Here is why existing tools fall short:

### Generic AI Chatbots (ChatGPT, Gemini, Claude)
- **Hallucinations:** They generate answers based on generic internet training data rather than a curated, authoritative legal corpus.
- **Temporal Blindness:** They cannot reliably distinguish which version of a law is currently in force (e.g., they might cite a superseded 2013 rule instead of the 2024 amendment).
- **Cross-Jurisdictional Contamination:** They often mix up Indian laws with US or EU regulations in a single answer.

### Existing Government Portals & Databases (e.g., e-Gazzete, India Code)
- **Fragmented:** Users have to search across dozens of different websites to piece together a single answer.
- **Keyword-Restricted:** They rely on exact keyword matching, meaning if a user doesn't know the exact legal jargon, they won't find what they need.
- **Not Conversational:** They do not answer questions; they just provide raw PDFs.

### International Legal-Tech Tools (e.g., Harvey, LexisNexis AI)
- **Irrelevant Focus:** They are built for Western corporate law, not Indian Ayurveda, ABS duties, or the Drugs and Cosmetics Act.
- **Language Barriers:** They do not natively support Indian regional languages.

---

## 4. Our Approach to Solving It (VaidyaSetu)

To solve these issues, we are not just building a basic chatbot. We are building a **Strict Legal AI Pipeline**.

Here is our step-by-step approach:

1. **Pre-Classification of Formulations:** 
   Before answering IP questions, the AI asks the user questions to classify their formulation (e.g., Classical vs. Proprietary vs. Phytopharmaceutical). This is crucial because each category faces completely different legal rules.

2. **Jurisdiction Partitioning:** 
   We physically separate the vector database into "National" (India) and "International" indices. The AI explicitly switches between these contexts so it never accidentally blends Indian and foreign laws together.

3. **Hybrid Retrieval (Dense + Sparse Fusion):** 
   When a user asks a question, we don't just rely on semantic meaning (Dense search). We combine it with exact keyword matching (Sparse BM25) to ensure we fetch the highly specific legal clauses required.

4. **Citation-Grounded Generation:** 
   The AI is strictly instructed to generate answers *only* from the documents we feed it. It must cite the specific statute, rule, or treaty article (e.g., *Section 3(p) of the Patents Act*) behind every claim.

5. **Multilingual Support (Bhashini):** 
   The system accepts queries in local Indian languages, processes the retrieval in English/Hindi natively using multilingual embeddings, and translates the final cited answer back to the user's preferred language.

6. **Confidence Scoring:** 
   If the system cannot find a relevant law in its database to answer the user's question, it will confidently abstain (refuse to answer) rather than hallucinating a fake legal response.
