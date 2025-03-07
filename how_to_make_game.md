Below is an updated version of **how_to_make_game.md** that incorporates your new requirements for splitting the project into a Spring Boot backend and a Next.js frontend, online play, and the revised combat mechanics (super attacks, MP usage, HP totals, etc.).

---

# Java Game Implementation Workflow for Copilot

## Step 1: Architecture Overview
This game is split into two main components:
1. **Backend (Spring Boot)**: Responsible for game logic, session management, character stats, and state persistence.
2. **Frontend (Next.js)**: Provides the user interface. Players connect here to create or join sessions and interact with the game in real time.

The game allows online play. You can invite one friend to join a session, or you can play solo. The backend will handle turn-by-turn logic and coordinate attacks, HP calculations, and any special moves.

## Step 2: Base Class Setup (Java Backend)
1. Create an abstract `Character` class with:
   - **Fields**: 
     - `name` (String)  
     - `pv` (int) – Current HP.
   - **Abstract Method**: 
     - `attack(Character target)`.
   - **Concrete Methods**: 
     - `isAlive()` – Returns `pv > 0`.  
     - `takeDamage(int amount)` – Subtracts `amount` from `pv`.  
   - **Constructor**:  
     - Initialize `name`, `pv`.  
     - Validate `pv` (throws `IllegalStateException` if `pv < 0`).

2. The core logic (combat, attacks, etc.) runs in Spring Boot. Each `Character` subclass will be a bean or standard object, depending on your design.

## Step 3: Player Hierarchy (Java Backend)
1. Create an abstract `Player` class extending `Character`:
   - **Field**: `experience` (int).  
   - **Constructor**: Initializes `name` and `pv`.  
   - Additional logic for shared player functionality (e.g., awarding experience).

2. Create a `Knight` subclass extending `Player`:
   - Constructor calls super with fixed or parameterized HP (default 100 HP is recommended).
   - Implement regular `attack()` logic (normal attack damage = 30).

3. Create a `Wizard` subclass extending `Player`:
   - Additional field: `mp` (magic points), default 100.  
   - Constructor with `name`, `pv` (default 100), and `mp` (default 100 if not specified).  
   - Implement regular `attack()` logic (normal attack damage = 30).

## Step 4: Enemy Implementation (Java Backend)
1. Create `Enemy` (or `Boss`) class extending `Character`:
   - You can retain a `LootType` enum if you want (e.g., `POTION`, `MANA_POTION`).
   - Field: `loot` (LootType) if using loot drops.
   - Constructor includes `name`, `pv`, and possibly `loot`.

2. The `Enemy`’s normal attacks also deal 30 damage, but you’ll add logic to distinguish whether it’s hitting a Knight or a Wizard (especially for the super attack, detailed below).

## Step 5: Attack Mechanics & Super Attacks
The combat system supports both **normal attacks** and **super attacks**, plus the Wizard’s ability to heal.

### HP & MP Totals
- All **players** (Knight, Wizard): **100 HP** by default.
- **Boss (Enemy)**:
  - If there is **1 player** in the session, boss has **120 HP**.
  - If there are **2 players** in the session, boss has **180 HP**.
- **Wizard**: 
  - Total **100 MP**.
- **Knight**: 
  - No MP, but must track how many normal attacks have been made (to trigger a super attack).

### Normal Attacks
- Knight, Wizard, and Enemy each deal **30 damage** on a normal attack.

### Super Attacks
1. **Knight**:
   - Gains a super attack **after performing 3 normal attacks**.  
   - Can **stack** these triggers; for example, after 6 normal attacks, the Knight has 2 super attacks available.
   - Super attack damage:
     - **40** if Knight is fighting **alone** (single-player scenario).
     - **60** if there is also a Wizard teammate.

2. **Wizard**:
   - Must spend **40 MP** to cast a super attack.
   - Super attack damage:
     - **40** if Wizard is **alone**.
     - **60** if the Wizard has a Knight ally.
   - Also has a **heal** ability, costing **30 MP**, which **restores 15 HP** to either the Wizard himself or the Knight.

3. **Enemy (Boss)**:
   - Has **two** types of attacks: normal and super.
   - **Normal attack**: Deals 30 damage.
   - **Super attack**:
     - Triggered **after** the Enemy hits the Knight and Wizard **4 times** total (if there are two players).
     - If there is only **one player**, the Enemy’s super attack is triggered after **3 hits**.
     - Super attack deals:
       - **25 damage** if it’s hitting the Knight alone.
       - **35 damage** if it’s hitting the Wizard alone.
       - **When two players are present**, the Enemy’s super attack hits **both** players at once for the same damage each.

## Step 6: Utility Methods & Comparisons
1. Implement `Comparable<Character>` in the base `Character` class:
   - Compare by `pv` descending (just an example).
2. Override `toString()` in all classes:
   - Include relevant fields: `name`, `pv`, `experience` (for players), `mp` (for wizards), and `loot` (for enemies).

## Step 7: Game Loop Structure (Java Backend)
The Spring Boot backend will maintain the game loop or turn-based interactions. A high-level outline:

1. **Initialization**:
   - Create one or two `Player` objects (e.g., `new Knight("Knight", 100)`, `new Wizard("Wizard", 100, 100)`).
   - Create an `Enemy("Boss", 120 or 180)` depending on player count.
   - Track turn order (Knight → Wizard → Enemy, etc.).
   - If two players join, store both in the current session.

2. **While the Enemy and at least one Player is alive**:
   - Each player acts in turn:
     - Decide to use normal attack or super attack (if available).
     - Wizard can also decide to heal if MP allows.
   - Enemy or Boss acts:
     - Uses normal or super attack according to triggers (hits done so far).
   - Check for game-over conditions:
     - All players defeated OR Enemy defeated.

3. **Post-Game**:
   - Sort remaining players using `Collections.sort()` by remaining HP (descending) or another criterion.
   - Print final statuses (or return JSON from the Spring Boot API).
   - If Enemy was defeated, handle loot distribution logic.

## Step 8: Next.js Frontend
1. **Session Management**:
   - Players can create or join a session. You might use a session ID or room code to keep track.
   - The Next.js app communicates with the Spring Boot backend via REST or WebSockets for real-time turn updates.

2. **UI Flow**:
   - A lobby page to create/join sessions.
   - A game page that shows:
     - Player HP, MP (for Wizard), and super attack availability.
     - Enemy HP, normal/super attack readiness, and which players have been hit.
   - Buttons or controls for choosing normal attack, super attack, or (if Wizard) heal.

3. **Real-Time Updates**:
   - When a player acts, the frontend sends a request to the backend. The backend processes the move, updates game state, and returns the result.  
   - The UI refreshes accordingly to show new HP totals, MP usage, next turn, etc.

## Step 9: Validation & Edge Cases
1. **Insufficient MP**:
   - Wizard cannot cast a super attack or heal if MP is below the required thresholds.
2. **Multiple Super Attacks** (Knight):
   - Knight may stack super attacks if multiple triggers are earned before using them.
3. **Enemy HP**:
   - Correctly set to 120 if single player, 180 if two players.
4. **Negative or Zero HP**:
   - Characters are considered dead if `pv <= 0`.
5. **Online Disconnects**:
   - If a player disconnects, you might allow them to reconnect, or declare the session a forfeit.

## Step 10: Suggested Test Data
1. **Solo Test**:
   - 1 Knight (100 HP) vs. Boss (120 HP).
   - Knight must land 3 normal attacks to earn super attack (40 damage).
2. **Two-Player Test**:
   - Knight (100 HP) + Wizard (100 HP, 100 MP) vs. Boss (180 HP).
   - Confirm that the boss’s super attack triggers after 4 hits on both players total, dealing simultaneous damage.
   - Knight’s super deals 60, Wizard’s super deals 60 if both are alive.
3. **Wizard Healing**:
   - Wizard tries using super attack a few times, then uses heal when MP is sufficient, verifying MP usage and HP gain.

---

**End of Updated File**