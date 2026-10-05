# 🚀 TrueLens AI
### AI-Powered Fake News & Deepfake Detection

> A production-ready multimodal AI system that detects misinformation by jointly analyzing **text, images, and video** using Deep Learning.

---

## 📌 Overview

This project presents a **Multi-Modal Detection System** capable of analyzing:
- 📝 Text  
- 🖼️ Images  
- 🎥 Videos  

It combines **NLP + Computer Vision** to detect fake news and deepfakes with high accuracy.

---

## ✨ Key Features

- 🔍 Multi-Modal Fusion  
- 🤖 Deepfake Detection  
- 🧠 NLP-Based Fake News Detection  
- ⚡ Real-Time Inference  
- 📊 Confidence Scoring  
- 🔌 Modular Architecture  

---

## 🏗️ System Architecture

```
User Input → Models (Text/Image/Video) → Fusion Layer → Classification
```

<img width="4447" height="7536" alt="diagram" src="https://github.com/user-attachments/assets/13fcf086-c942-43ed-bdad-ce5960663607" />

---

## 🧪 Tech Stack

- Python  
- PyTorch / TensorFlow  
- OpenCV  
- Transformers (BERT)  

---

## 📂 Project Structure

```
Multi-Modal-Detection/
├── data/
├── models/
├── notebooks/
├── src/
├── app/
├── requirements.txt
└── README.md
```

---

## ⚙️ Installation

```bash
git clone https://github.com/MiteshPanda/TrueLens-AI.git
cd TrueLens-AI
pip install -r requirements.txt
```

---

## ▶️ Usage

```bash
python main.py --input_type text --input "Sample news"
python main.py --input_type image --input path/to/image.jpg
python main.py --input_type video --input path/to/video.mp4
```

---

## 📊 Output Example

```json
{
  "prediction": "Fake",
  "confidence": 0.92
}
```

---

## 📈 Future Improvements

- Audio modality  
- Explainable AI  
- Edge deployment  

---

## 🤝 Contributing

Pull requests are welcome.

---

## 📜 License

MIT License

---

## 👨‍💻 Author

Mitesh Panda  
GitHub: https://github.com/MiteshPanda
