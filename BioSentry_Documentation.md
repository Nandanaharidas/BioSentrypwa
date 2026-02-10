# BioSentry: Real-Time Adverse Drug Reaction (ADR) Monitoring System

## 1. Introduction
BioSentry is a state-of-the-art Progressive Web Application (PWA) designed to revolutionize patient safety through real-time Adverse Drug Reaction (ADR) monitoring. Pharmacovigilance—the science and activities relating to the detection, assessment, understanding, and prevention of adverse effects—is critical in modern healthcare. BioSentry bridges the gap between medication administration and clinical observation by leveraging wearable sensor data and computer vision AI.

The primary objective of BioSentry is to provide an early warning system for patients and healthcare providers. By continuously tracking physiological parameters and behavioral indicators, the system can predict the risk of ADRs before they escalate into life-threatening emergencies.

## 2. Existing System
In the current healthcare landscape, ADR monitoring is primarily a reactive and manual process. Patients are often required to self-report symptoms, which leads to several critical issues:
- **Delayed Reporting**: Patients may not recognize early symptoms or may wait until a reaction is severe before seeking help.
- **Subjectivity**: Self-reports are often influenced by patient perception, leading to inaccurate or incomplete data.
- **Fragmented Data**: Information about vitals is often captured intermittently during clinic visits, missing the "white space" of daily life where many ADRs occur.
- **Manual Oversight**: Healthcare providers must manually review patient records to identify potential drug-vitals interactions, a process prone to human error and oversight.

## 3. Proposed System
BioSentry proposes a proactive, automated, and continuous monitoring solution. The system integrates hardware and software to create a seamless safety net for patients:
- **Continuous Vitals Tracking**: Integration with wearable devices to monitor Temperature, Heart Rate (via SpO2), Blood Pressure, and Galvanic Skin Response (GSR) in real-time.
- **Vision AI Support**: Utilizing the front-facing camera and computer vision algorithms to detect behavioral signs of ADRs, such as shivering, distress, or changes in facial expression.
- **Automated Risk Prediction**: A sophisticated analysis engine that correlates medication data with physiological changes to classify ADR severity as Low, Medium, or High.
- **Instant Alerts**: Immediate notification to patients and emergency contacts when high-risk thresholds are breached.
- **PWA Accessibility**: Built as a Progressive Web Application, BioSentry works across various devices (mobile, tablet, desktop) without requiring traditional app store installations.

## 4. Module Description

### 4.1 User Authentication & Profile Module
Manages secure access to the platform using Firebase Authentication. Users can create profiles that store essential health data, including chronic conditions and emergency contact information. This ensures that all monitoring data is securely tied to the correct individual.

### 4.2 Medication Management Module
Allows patients to track their current prescriptions. It includes fields for medication names, batch numbers, and dosages. This module is the "context provider" for the monitoring engine, identifying which drugs are currently active in the patient's system.

### 4.3 Vitals Monitoring Module
The core engine for data ingestion. It handles the "pairing" process with external sensors and processes a stream of health metrics. It includes a real-time visualization layer that displays trends in Temperature, BP, O2 levels, and Skin Conductance using dynamic charting libraries.

### 4.4 Vision AI Module
Leverages `MediaDevices` API and machine learning models to analyze the patient's physical state. By monitoring for specific micro-symptoms (e.g., tremors or pallor), the Vision AI provides a critical second layer of detection that physiological sensors might miss.

### 4.5 Risk Analysis & Alerting Module
The "brain" of BioSentry. It evaluates the combined data from the vitals and vision modules against established clinical thresholds. If a potential ADR is detected:
- It classifies the severity.
- It provides actionable advice (e.g., "Consult a doctor").
- It facilitates immediate action through "Emergency Call" and "Report ADR" functionality.

## 5. System Architecture
BioSentry utilizes a modern, decentralized architecture:
- **Frontend**: SvelteKit for a reactive and high-performance user interface.
- **State Management**: Svelte Stores for real-time data flow across components.
- **Styling**: Tailwind CSS for a premium, medical-grade aesthetic with dark mode support.
- **Backend/Storage**: Firebase for secure user data and medication records.
- **Mock Data Engine**: A local Python-based simulation server (for developmental testing) that provides live sensor data.

## 6. System Design Philosophy
The UI is designed with a "Patient-First" philosophy. It uses a clean, high-contrast dark theme with vibrant color coding for vitals (Blue for O2, Orange for Temp, Rose for BP). Large, accessible buttons and clear typography ensure that the application is usable even when a patient is feeling unwell.

## 7. Conclusion
BioSentry represents a significant leap forward in pharmacovigilance. By transforming ADR monitoring from a retrospective reporting task into a real-time predictive service, BioSentry can save lives, reduce hospitalization costs, and empower patients to manage their treatments more safely. As wearable technology and AI continue to evolve, BioSentry is positioned at the forefront of the digital health revolution, ensuring that every dose of medication is accompanied by a silent, vigilant guardian.
