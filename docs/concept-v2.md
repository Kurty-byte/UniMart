# Concept Paper: UniMart

## 1. Project Overview

**Project Name:** UniMart

**Platform Type:** Web Application

UniMart is a centralized, closed-loop buy-and-sell platform designed exclusively for the university ecosystem. It facilitates the safe and organized exchange of pre-owned academic materials and gear such as first-year Physical Education equipment, college-specific uniforms, and textbooks. To eliminate the risks of online scams and meetup flaking, UniMart utilizes a physical "Admin Hub" consignment model, streamlining operations through a secure, QR-code-driven workflow and unified student accounts.

## 2. Problem Statement

University students frequently purchase "use-it-once" items that retain significant value but are difficult to resell once the semester ends. Generic platforms (like Facebook Marketplace) expose students to external scammers, unregulated pricing, and unreliable peers who flake on campus meetups. Furthermore, coordinating physical handovers and managing cash payments between students can be logistically frustrating due to conflicting class schedules. Finally, forcing students to navigate complex "seller onboarding" processes creates friction that prevents them from listing low-cost items.

## 3. Proposed Solution & Core Features

UniMart solves these issues by acting as a trusted intermediary for all physical and financial exchanges, ensuring 100% security and ease of use for the student body.

* **Unified Student Profiles:** Recognizing that students frequently swap between buying and selling, every verified account has seamless, instant access to both functionalities. A single profile manages both active listings and cart reservations, along with a universal e-wallet payout setting.

* **Admin-Facilitated Consignment Model:** All physical items and cash payments pass through a centralized campus Admin Hub, completely eliminating peer-to-peer scams and meetup no-shows.

* **QR-Code Driven Transactions:** The platform generates unique QR codes for every step of the process (item drop-off, buyer claiming) to eliminate administrative data-entry errors and ensure strict security during physical handovers.

* **Two-Stage Reservation System:** To prevent item hoarding, reservations are split into two phases. First, adding an item to the cart places a short-term "Soft Hold" that resets as long as the user remains active in the app. Second, explicitly confirming the purchase triggers a strict "Hard Hold" countdown for the physical handover. If either timer expires, the item automatically returns to the public catalog.

* **Dual-Payout System:** Once an item is sold, the admin can choose to disperse funds digitally to the listing student's e-wallet (via a provided QR code) or notify them to claim physical cash at the hub, maintaining operational liquidity for the admin.

* **In-App Messaging:** Students can communicate securely within the platform to ask questions about the item prior to purchase.

## 4. Operational Workflow

The system operates on a strict physical-meets-digital lifecycle:

* **Listing & Drop-off:**
  * A student decides to sell an item, posts it on the app via their unified dashboard, and receives a unique "Drop-off QR Code."
  * The student brings the physical item to the Admin Hub.
  * The admin scans the QR code, verifies the item, and approves it. The item is now live in the catalog.

* **Cart Reservation (Soft Hold):**
  * Another student browses the catalog and adds an item to their cart. (The system prevents students from adding their own listings to their cart).
  * The item's available quantity decreases by the selected amount, and a short-term rolling timer (e.g., 15 minutes) begins.
  * As long as the purchasing student remains active in the app, the timer refreshes. If they go inactive/idle and the timer runs out, the item's quantity is restored to the public catalog.

* **Commitment to Buy (Hard Hold):**
  * Before the cart timer expires, the purchasing student explicitly presses "Buy" and confirms the reservation.
  * The system issues a "Claim QR Code" to the student and starts a strict, fixed countdown timer (e.g., 24 hours) for them to visit the Admin Hub. This absolute timer continues regardless of online status.

* **Purchase & Handover:**
  * The purchasing student visits the Admin Hub and presents the Claim QR Code before their hard hold timer expires.
  * The admin scans it, accepts the physical cash payment, and physically hands the item to the student. The system marks the item as sold.

* **Payout:**
  * Upon marking the item as sold, the admin UI displays the listing student's preferred e-wallet QR code.
  * The admin can scan and send the money digitally immediately. If the admin lacks digital funds, they can select "Hold for Cash Claim," which notifies the listing student to pick up their cash at the hub.

* **Item Expiration:**
  * If an item sits at the Admin Hub unsold for a predetermined period, it is marked as expired, and the listing student is notified to retrieve it.

## 5. User Stories

### Student Stories (Unified Role)

* **As a student listing an item**, I want to receive a unique QR code when I post my item, so that my drop-off at the Admin Hub is fast and secure.
* **As a student**, I want a single profile where I can manage my active item listings and my cart purchases in one place, so I don't have to switch accounts.
* **As a student**, I want to save my e-wallet QR code in my profile settings once, so that I can automatically receive digital payouts whenever my items sell.
* **As a student browsing items**, I want to filter the catalog by specific college courses, so that I can easily find the exact gear I need for my classes.
* **As a student adding to my cart**, I want items to be temporarily reserved while I continue browsing, so that no one else buys them out from under me.
* **As a student ready to buy**, I want a guaranteed 24-hour window once I explicitly click "Buy," so that I have enough time to walk to the Admin Hub between classes to complete my purchase.
* **As a student**, I want to use in-app messaging to ask the original owner questions about the item's condition before I decide to reserve it.
* **As a student picking up an item**, I want a unique Claim QR code, so that the admin knows I am the rightful purchaser of the reserved item.

### Admin Stories

* **As an admin**, I want to scan QR codes for item drop-offs and buyer claims, so that I don't have to manually type in long item IDs or user details.
* **As an admin**, I want to see a dual-payout screen when an item sells, so that I can choose to pay the listing student digitally if I have the funds, or hold physical cash for them if I don't.
* **As an admin**, I want the system to automatically return reserved items to the public catalog if the purchasing student's timer (either cart inactivity or the 24-hour claim window) runs out, so that inventory doesn't stagnate.
