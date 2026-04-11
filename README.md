# deep-in-net 🌐

A hands-on networking project built with **Cisco Packet Tracer**, covering foundational concepts in network design, device configuration, protocol behavior, and the OSI model — from simple peer-to-peer connections to multi-subnet routed architectures.

---

## Table of Contents

- [Overview](#overview)
- [Tools & Prerequisites](#tools--prerequisites)
- [Knowledge Base](#knowledge-base)
- [Exercises](#exercises)
  - [Exercise 1 – Direct PC Communication](#exercise-1--direct-pc-communication)
  - [Exercise 2 – Switch vs Hub](#exercise-2--switch-vs-hub)
  - [Exercise 3 – Network Services](#exercise-3--network-services)
  - [Exercise 4 – Router Basics](#exercise-4--router-basics)
  - [Exercise 5 – Two Subnets via Router](#exercise-5--two-subnets-via-router)
  - [Exercise 6 – Static Routing](#exercise-6--static-routing)
  - [Exercise 7 – Multi-device Routing](#exercise-7--multi-device-routing)
  - [Exercise 8 – Three Subnets Full Mesh](#exercise-8--three-subnet-full-mesh)
- [File Structure](#file-structure)

---

## Overview

This project introduces fundamental networking concepts through progressive exercises using **Cisco Packet Tracer**. Each exercise builds on the previous one, covering:

- Physical and logical network device configuration
- Essential protocols: DHCP, DNS, HTTP, HTTPS, FTP, TCP, UDP
- IP addressing, subnetting, and routing
- OSI model layer identification
- Linux networking commands

---

## Tools & Prerequisites

| Tool | Purpose |
|------|---------|
| [Cisco Packet Tracer](https://www.netacad.com/courses/packet-tracer) | Network simulation |
| Linux CLI | `ping`, `traceroute`, `ifconfig`, `hostname` |
| Cisco IOS CLI | Device configuration via terminal |

**Useful Linux commands:**
```bash
ping <IP>           # Test connectivity
traceroute <IP>     # Trace packet path
ifconfig            # View/configure network interfaces
hostname            # Verify device names
```

---

## Knowledge Base

### Networking Cables

| Type | Use Case |
|------|----------|
| **RJ-45 Straight-through** | Connect different device types (PC ↔ Switch, Switch ↔ Router) |
| **RJ-45 Crossover** | Connect same device types (PC ↔ PC, Switch ↔ Switch) |



# ##########################################
# RJ-45 Cable: Straight-Through vs Crossover

## The 4 pins that matter

```
Pin 1 — TX+   Pin 2 — TX−   (Transmit)
Pin 3 — RX+   Pin 6 — RX−   (Receive)
```

> For communication to work: **TX on one side must connect to RX on the other.**

---

## Two port types

| Type  | Device              | Transmits on | Receives on |
|-------|---------------------|--------------|-------------|
| MDI   | PC, Laptop          | 1 & 2        | 3 & 6       |
| MDI-X | Switch, Router, Hub | 3 & 6        | 1 & 2       |

---

## The rule

```
MDI  ←→ MDI-X  →  Straight-through  (ports are opposite, no swap needed in cable)
MDI  ←→ MDI    →  Crossover         (same ports, cable must swap TX↔RX)
MDI-X ←→ MDI-X →  Crossover         (same ports, cable must swap TX↔RX)
```

---

## Straight-through

Same pin order on both ends. Works because MDI-X ports are **already reversed inside**.

```
PC (MDI)              Router/Switch (MDI-X)
TX+ pin1 ──────────── pin1 RX+
TX− pin2 ──────────── pin2 RX−
RX+ pin3 ──────────── pin3 TX+
RX− pin6 ──────────── pin6 TX−
```

## Crossover

Cable swaps TX↔RX. Used when both devices have the same port type.

```
PC A (MDI)            PC B (MDI)
TX+ pin1 ──────╮───── pin3 RX+
TX− pin2 ────╮─╰───── pin6 RX−
RX+ pin3 ────╰──────── pin1 TX+
RX− pin6 ────────────── pin2 TX−
```

---

## Reference table

| Connection       | Cable                  |
|------------------|------------------------|
| PC → Switch      | Straight-through       |
| PC → Router      | Straight-through       |
| PC → PC          | Crossover              |
| Switch → Switch  | Crossover              |
| Switch → Router  | Crossover              |
| Modern devices   | Either (Auto-MDI/MDIX) |


---

# Subnet Blocks — How to Find Your Network

## Block size = total IPs in the subnet

```
/29 → 2^(32-29) = 2³ = 8 addresses per block
```

The entire IP range is divided into equal chunks of that size:

```
  0 ──────────  7
  8 ────────── 15
 16 ────────── 23
 24 ────────── 31
 32 ────────── 39
 40 ────────── 47
 48 ────────── 55
 56 ────────── 63
 64 ────────── 71
 72 ────────── 79
 80 ────────── 87  ← IP 83 lives here
 88 ────────── 95
 96 ────────── ...
```

Each block starts at a **multiple of 8**.

---

## How to find which block an IP belongs to

**Example: `111.111.111.83/29`**

```
Step 1 — find block size:   32 - 29 = 3 host bits → 2³ = 8

Step 2 — divide:            83 ÷ 8 = 10.375

Step 3 — drop decimal:      10

Step 4 — multiply back:     10 × 8 = 80  ← network address

Step 5 — find broadcast:    80 + 8 - 1 = 87  ← broadcast address
```

**Result:**

```
111.111.111.80   → network address        (cannot assign)
111.111.111.81   → usable host ✓
111.111.111.82   → usable host ✓
111.111.111.83   → usable host ✓  ← your IP
111.111.111.84   → usable host ✓
111.111.111.85   → usable host ✓
111.111.111.86   → usable host ✓
111.111.111.87   → broadcast address      (cannot assign)

Total = 8  |  Usable = 6  (8 - 2)
```

---

## Formula for any subnet

```
Block size  =  2^(32 - prefix)
Usable IPs  =  block size - 2
Network     =  floor(IP ÷ block size) × block size
Broadcast   =  network + block size - 1
```

---

## Common subnet reference

```
Prefix  Mask                Block size   Usable hosts
/25     255.255.255.128         128           126
/26     255.255.255.192          64            62
/27     255.255.255.224          32            30
/28     255.255.255.240          16            14
/29     255.255.255.248           8             6
/30     255.255.255.252           4             2
/31     255.255.255.254           2             0 (or 2 for point-to-point)
/32     255.255.255.255           1             1 (single host)
```

### Network Devices & OSI Layers

| Device | OSI Layer | Function |
|--------|-----------|----------|
| **Hub** | Layer 1 – Physical | Broadcasts all traffic to every port |
| **Switch** | Layer 2 – Data Link | Forwards frames using MAC address table |
| **Router** | Layer 3 – Network | Routes packets between subnets using IP addresses |

**Switch vs Hub:**
- A **hub** floods traffic to all ports — no intelligence, creates collisions.
- A **switch** learns MAC addresses and forwards traffic only to the correct port — efficient and collision-free per port.

---
# Network Hardware Guide: Hubs vs. Switches

This guide explains the fundamental differences between Layer 1 and Layer 2 interconnect devices.

---

## 1. The Hub (Physical Layer)
A **Hub** is a non-intelligent device that acts as a multi-port repeater. It operates at **Layer 1 (Physical)** of the OSI model.

### How it works:
* **Broadcasting:** When a Hub receives a data frame on one port, it duplicates that frame and sends it out to **every other port**.
* **Shared Bandwidth:** All devices connected to a hub share the same total bandwidth.
* **Half-Duplex:** Devices can only send OR receive at one time, not both.

### The Problem: Collisions
Because everyone shares the same "wire" logic, if two devices talk at once, a **collision** occurs. Hubs use **CSMA/CD** to manage these crashes, which slows down the network.

---

## 2. The Switch (Data Link Layer)
A **Switch** is an intelligent device that operates at **Layer 2 (Data Link)**. It uses hardware addresses (MAC addresses) to make forwarding decisions.

### How it works:
* **MAC Learning:** The switch builds a **MAC Address Table** (CAM Table). It records which device is on which physical port.
* **Unicast Forwarding:** The switch checks the destination MAC and sends the frame **only** to the specific port where that device lives.
* **Full-Duplex:** Each port is its own "private hallway," allowing simultaneous send/receive without collisions.

---

## 3. Comparison Table

| Feature | Hub | Switch |
| :--- | :--- | :--- |
| **OSI Layer** | **Layer 1** (Physical) | **Layer 2** (Data Link) |
| **Intelligence** | None (Passive) | High (Active Learning) |
| **Data Unit** | Bits | Frames |
| **Transmission** | Broadcast (One-to-All) | Unicast (One-to-One) |
| **Collision Domain** | One shared domain | One domain per port |
| **Speed** | Slow (Shared) | Fast (Dedicated per port) |

---

## 4. Position in the OSI Model

1. **Layer 3 (Network):** **Routers** (Logic: IP Addresses)
2. **Layer 2 (Data Link):** **Switches** (Logic: MAC Addresses)
3. **Layer 1 (Physical):** **Hubs**, Cables, Repeaters (Logic: Electrical Signals/Bits)

---

### Key Takeaway
* **Hubs** shout at everyone. They are "dumb" and inefficient.
* **Switches** talk to specific devices. They are "smart" and maintain private communication.
---

### Protocols & Ports

| Protocol | Port | Transport | OSI Layer | Description |
|----------|------|-----------|-----------|-------------|
| **DHCP** | 67/68 | UDP | Layer 7 (App) | Automatically assigns IP addresses to devices |
| **DNS** | 53 | UDP/TCP | Layer 7 (App) | Resolves domain names to IP addresses |
| **HTTP** | 80 | TCP | Layer 7 (App) | Unencrypted web communication |
| **HTTPS** | 443 | TCP | Layer 7 (App) | Encrypted web communication via TLS/SSL |
| **FTP** | 20/21 | TCP | Layer 7 (App) | File transfer between client and server |

**TCP vs UDP:**
- **TCP** (Transmission Control Protocol) — connection-oriented, reliable, ordered delivery. Used by HTTP, HTTPS, FTP.
- **UDP** (User Datagram Protocol) — connectionless, faster, no delivery guarantee. Used by DHCP, DNS.

Both operate at **OSI Layer 4 (Transport)**.

---

### DNS Record Types

| Record | Description |
|--------|-------------|
| **A** | Maps a hostname to an IPv4 address |
| **CNAME** | Maps an alias to another hostname |
| **MX** | Mail exchange record |
| **NS** | Name server record |

In Exercise 3:
- `deep-in-net.local` → `192.168.1.99` (A record)
- `deep-in-net.com` → `deep-in-net.local` (CNAME record)

---

### Default Gateway

The **default gateway** is the IP address of the router interface on a device's local subnet. It's used to forward packets destined for addresses outside the local network.

---

### Routing Table

A **routing table** is a data structure stored in a router that lists:
- Known destination networks
- The next hop (next router or exit interface) to reach each destination
- Metric/cost of each path

Routers consult this table for every packet to determine where to forward it.

---

## Exercises

### Exercise 1 – Direct PC Communication

**Topology:** 3 pairs of PCs connected directly via crossover cables.

**Configuration:**
- PC0 ↔ PC1: same subnet, static IPs
- PC2 ↔ PC3: same subnet, static IPs
- PC4 ↔ PC5: same subnet, static IPs

**Cable used:** RJ-45 Crossover (PC to PC, same device type)

---

### Exercise 2 – Switch vs Hub

**Topology:** Group of PCs connected to a switch; another group connected to a hub.

**Behavior:**
- Switch group: unicast communication, no unnecessary broadcast
- Hub group: all traffic broadcast to all ports

**OSI layers:**
- Hub → Layer 1
- Switch → Layer 2

---

### Exercise 3 – Network Services

**Topology:** PCs + 4 dedicated servers (DHCP, DNS, HTTPS, FTP) on a switched network.

**Server configurations:**

| Server | Static IP | Service |
|--------|-----------|---------|
| DHCP | 192.168.1.1 | IP assignment for all PCs |
| DNS | 192.168.1.2 | Name resolution |
| HTTPS | 192.168.1.99 | Secure web (HTTP disabled) |
| FTP | 192.168.1.4 | File transfer |

**DNS records configured:**

deep-in-net.local  →  192.168.1.99  (A record)
deep-in-net.com    →  deep-in-net.local  (CNAME)


**FTP user:** `deepinnet` with `RWDNL` permissions

**HTTPS:** Displays a hello message; HTTP access is disabled.

**Verification:** Browse to `https://deep-in-net.com` from a PC → resolves via DNS → reaches HTTPS server.

---

### Exercise 4 – Router Basics

**Topology:** Two PCs on different subnets connected via a router.

**Concepts applied:**
- Assigned IPs on each router interface (one per subnet)
- Set default gateway on each PC to the router's interface in its subnet
- Verified communication with `ping`

**Router role:** Forwards packets between subnets using IP routing (Layer 3).

---

### Exercise 5 – Two Subnets via Router

**Topology:** Two groups of PCs on separate switches, connected through a router.

**Configuration:**
- Subnet 1: e.g. `192.168.1.0/24`
- Subnet 2: e.g. `192.168.2.0/24`
- Router interfaces assigned .1 of each subnet
- All PCs use their router interface as default gateway
- DHCP or static IPs depending on setup

**Verification:** Ping from Subnet 1 PC → Subnet 2 PC and vice versa.

---

### Exercise 6 – Static Routing

**Topology:** Two PCs on different subnets connected via two routers.

**Configuration:**
- Each router has a static route pointing to the other subnet via the neighboring router's IP
- Default gateways set on each PC

**Routing table entries added manually:**

Router1: route to Subnet2 via Router2's interface IP
Router2: route to Subnet1 via Router1's interface IP

---

### Exercise 7 – Multi-device Routing

**Topology:** Multiple devices per subnet, two subnets, connected via a router.

**Configuration:**
- Multiple PCs per switch
- Static IPs or DHCP-assigned addresses
- Router handles inter-subnet traffic
- Verified full mesh communication within and across subnets

---

### Exercise 8 – Three-Subnet Full Mesh

**Topology:** Three subnets, each with a switch and multiple PCs, all connected via routers.

**Subnets:**
| Subnet | Network Address | Gateway |
|--------|----------------|---------|
| Subnet 1 | e.g. `192.168.1.0/24` | `192.168.1.1` |
| Subnet 2 | e.g. `192.168.2.0/24` | `192.168.2.1` |
| Subnet 3 | e.g. `192.168.3.0/24` | `192.168.3.1` |

**Routing:** Static routes configured on each router to reach all non-directly-connected subnets.

**Verification:** Every PC can ping every other PC across all three subnets.

---

## File Structure

```
deep-in-net/
├── ex01.pkt       # Direct PC pairs
├── ex02.pkt       # Switch and Hub network
├── ex03.pkt       # DHCP, DNS, HTTPS, FTP servers
├── ex04.pkt       # Basic router between two subnets
├── ex05.pkt       # Two subnets via router with multiple PCs
├── ex06.pkt       # Static routing between two routers
├── ex07.pkt       # Multi-device two-subnet routing
├── ex08.pkt       # Three-subnet full mesh routing
├── bonus.pkt      # Bonus topology
└── README.md      # This file
```

---

> "Networking plays a critical role in various IT specialties, and is particularly essential for cloud and DevOps engineering. Be curious and never stop searching!"