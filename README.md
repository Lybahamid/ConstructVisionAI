# ConstructVision AI
### Real-Time Construction Site Safety & PPE Compliance Monitoring

ConstructVision is a professional-grade, AI-powered monitoring platform designed to enhance safety protocols in high-risk construction environments. By utilizing Google's Gemini 3 Flash model, the system performs real-time visual analysis of job sites to detect personnel and ensure the correct usage of Personal Protective Equipment (PPE).

[![Safety Compliance](https://img.shields.io/badge/Compliance-Safety_First-emerald.svg)](https://github.com/)
[![AI Powered](https://img.shields.io/badge/AI-Gemini_Flash-orange.svg)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

![alt text](/import/ConstructV-ezgif.com-video-to-gif-converter.gif)
![alt text](/import/2.png)
---
## 🌟 Key Features
- **Live Site Monitoring**: Stream live video directly from site cameras or mobile devices via WebRTC.
- **Smart PPE Detection**: Automated detection of Hard Hats and Safety Vests with high-precision bounding boxes.
- **Real-Time Violation Alerts**: Instant visual flagging and logging of safety violations ("No Hard Hat", "No Vest").
- **Dynamic Analytics Dashboard**:
  - **Compliance Trends**: Visualized data showing site safety performance over time.
  - **Risk Heatmaps**: Identify recurring violation types to better target safety training.
- **Automated Incident Logging**: Persistent log of violations including high-resolution thumbnails for post-incident review.
- **Zero-Storage Privacy**: All processing is done in-flight, ensuring minimal data retention unless an incident is logged.

## 🛠️ Technical Architecture

- **Frontend**: React 19 (TypeScript) + Tailwind CSS + Framer Motion
- **Vision Engine**: Google Gemini 3 Flash (via `@google/genai`)
- **Backend API**: Node.js + Express
- **State Management**: React Hooks & Context API
- **Charts**: Recharts for data visualization

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.0 or higher)
- [Google Gemini API Key](https://aistudio.google.com/app/apikey)

### Local Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/constructvision.git
   cd constructvision
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open the application:**
   Navigate to `http://localhost:3000` in your browser.

## 📱 Mobile Usage

ConstructVision is fully responsive. For field inspections:
1. Access the dashboard from a smartphone.
2. Select **Live Stream** mode.
3. Use the **Switch Camera** button to use the rear-facing camera for site inspections.

## 🛡️ Future Roadmap

- [ ] Integration with site-wide CCTV/IP Camera streams (RTSP/ONVIF).
- [ ] SMS/Email notifications for safety managers when high-risk violations occur.
- [ ] Personnel identification for authorized zone access.
- [ ] Multi-site coordination from a unified operations center.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
*Built to ensure every worker goes home safe.*
