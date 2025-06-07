# Octopus Tracker Tariff

A single-page website and Scriptable widget for monitoring the Octopus Tracker tariff. Easily select your region, date, and tariff to view current and next day prices.

---

## Overview

- **Website:**  
  View tariff information on a single-page website with customizable settings.
  
- **Scriptable Widget:**  
  Display current and next day prices directly on your home screen using the Scriptable app.

---

## URL Configuration

You can set the region and tariff directly in the URL. For example:

https://octopustracker.small3y.co.uk/?region=M&tariff=SILVER-24-04-03


- **region**: The region code (e.g., `M`)
- **tariff**: The tariff code (e.g., `SILVER-24-04-03`)

---

## Available Tariffs

- **SILVER-24-07-01** – July 2024
- **SILVER-24-04-03** – April 2024
- **SILVER-23-12-06** – December 2023
- **SILVER-24-10-01** – October 2024
- **SILVER-24-12-31** – December 2024
- **SILVER-25-04-11** – April 2025
- **SILVER-25-04-15** – April 2025 V2

---

## Supported Regions

- **A** – Eastern England  
- **B** – East Midlands  
- **C** – London  
- **D** – Merseyside and Northern Wales  
- **E** – West Midlands  
- **F** – North Eastern England  
- **G** – North Western England  
- **H** – Southern England  
- **J** – South Eastern England  
- **K** – Southern Wales  
- **L** – South Western England  
- **M** – Yorkshire  
- **N** – Southern Scotland  
- **P** – Northern Scotland  

![Regions](https://github.com/smalley1992/OctopusEnergyTrackerPrices/assets/21759375/29f4e590-6ab4-48d0-87b4-0192d5e25497)

---

## Scriptable Widget Details

This Scriptable widget displays:
- **Today's Price:** Shown in a large, prominent font.
- **Tomorrow's Price:** Displayed with an arrow indicating the price change (up for an increase, down for a decrease).

> **Note:** The region is set on line 32 of the script.

---

## Installation

### 1. Download Scriptable
If you haven't already, download and install the [Scriptable app](https://apps.apple.com/us/app/scriptable/id1405459188) from the iOS App Store.

### 2. Add the Script
- Open Scriptable and tap the **'+'** icon to create a new script.
- Name the script **Octopus Energy Tracker**.

### 3. Copy and Paste the Code
- Copy the code from the widget file that corresponds with your desired tariff (available in this GitHub repository).
- Paste the code into your new script in Scriptable.

---

## Usage

After installing the script, add the widget to your home screen by following these steps:

1. **Enter Jiggle Mode:**  
   Long-press an empty area on your home screen or hold down an app until the icons start jiggling.
   
2. **Add the Widget:**  
   Tap the **'+'** icon in the top left corner, search for **Scriptable**, and select it.
   
3. **Choose Widget Size:**  
   Select the smallest-sized widget for the best layout, then tap **'Add Widget'**.
   
4. **Configure the Widget:**  
   - Tap and hold the newly added widget.
   - Select **'Edit Widget'**.
   - Choose the **Energy Tracker** script from the Script option and hit **'Choose'**.
   
5. **Place the Widget:**  
   Move the widget to your preferred location on the home screen.

*Credit to MatasKaucikas for the widget instructions.*

![Widget Setup](https://github.com/smalley1992/OctopusEnergyTrackerPrices/assets/21759375/e7dc68cc-0a3c-4445-85c4-352c2e235a6c)

---

This setup will help you keep track of the latest tariff prices and make adjustments as needed via your website or home screen widget. Enjoy tracking your energy tariffs!
