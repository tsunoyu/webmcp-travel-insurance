# Demo Travel Insurance Site with WebMCP

A modern, client-side travel insurance demonstration built to showcase **WebMCP** (Web Model Context Protocol) capabilities. This application simulates a full insurance product lifecycle—from quoting to claiming—and exposes these actions as tools for AI agents.

## Features

- **Smart Quoting Engine**: implementation of risk logic (e.g., age, hazardous activities) that dynamically adjusts premiums.
- **Plan Inventory**: Filterable insurance products (Visa Compliant, Zero Deductible).
- **Policy Management**: Simulated policy purchasing and dashboard view.
- **Claims System**: Randomized claim adjudication (Auto-Approved vs. Under Review).
- **WebMCP Integration**: Full suite of tools registered with `navigator.modelContext`.

## WebMCP Tools

This demo registers the following tools with the browser's Model Context Provider:

| Tool Name | Description | Inputs |
| :--- | :--- | :--- |
| `travel_get_quote` | Generates a quote based on trip details. | `destination`, `days`, `age`, `activities` |
| `travel_list_plans` | Lists available plans with optional filters. | `visa_compliant`, `zero_deductible` |
| `travel_purchase_policy` | Purchases a policy from a generated quote. | `quote_id`, `plan_id` |
| `travel_file_claim` | Files a claim on an active policy. | `policy_id`, `reason` |
| `travel_check_claim_status` | Checks the status of a specific claim. | `claim_id` |

## Sample Prompts to Test

You can use these prompts with a WebMCP-enabled agent to test the tools:

### 1. Planning a Trip
> "I'm planning a ski trip to the Swiss Alps for 10 days. I'm 28 years old. Can you give me a quote?"
*(Should trigger `travel_get_quote` with destination='europe', activities=['Skiing'])*

### 2. Filtering Options
> "Show me only the plans that are Visa Compliant for my trip."
*(Should trigger `travel_list_plans` with visa_compliant=true)*

### 3. Purchasing a Policy
> "I'd like to buy the Digital Nomad plan from that quote."
*(Should trigger `travel_purchase_policy` with the correct ID)*

### 4. Filing a Claim
> "I need to file a claim. I lost my luggage at the airport yesterday."
*(Should trigger `travel_file_claim` with the active policy ID)*

### 5. Combined Flow (Quote + Filter + Purchase)
> "I'm 28 years old planning a 10-day ski trip to the Swiss Alps. Please get me a quote, then filter for Visa Compliant plans, and finally purchase the Digital Nomad plan."
*(Should trigger multiple tools in sequence: `travel_get_quote` -> `travel_list_plans` -> `travel_purchase_policy`)*

## Project Structure

- `index.html`: Main application structure.
- `style.css`: Modern "Aquamarine" theme and responsive layout.
- `app.js`: Business logic, state management, and WebMCP tool definitions.


