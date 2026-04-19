# deep-in-net 🌐

A hands-on networking project built with **Cisco Packet Tracer**, covering
foundational concepts in network design, device configuration, protocol
behavior, and the OSI model — from simple peer-to-peer connections to
multi-subnet routed architectures.

---

## Table of Contents

1. [OSI Model](#osi-model)
2. [Cables](#cables)
3. [Devices](#devices)
4. [IP Addressing & Subnetting](#ip-addressing--subnetting)
5. [Protocols](#protocols)
6. [Routing](#routing)
7. [Exercises](#exercises)
8. [Bonus](#bonus)
9. [File Structure](#file-structure)

---

## OSI Model

The OSI model describes the 7 layers of network communication.
Every protocol and device maps to a specific layer.

```
Layer 7 — Application   →  HTTP, HTTPS, FTP, DNS, DHCP
Layer 6 — Presentation  →  TLS/SSL encryption
Layer 5 — Session       →  session management
Layer 4 — Transport     →  TCP, UDP (ports)
Layer 3 — Network       →  IP, ICMP, ARP, Router
Layer 2 — Data Link     →  MAC addresses, Switch, Frames
Layer 1 — Physical      →  Cables, Hub, Bits
```

| Device | OSI Layer | Works with    |
| ------ | --------- | ------------- |
| Hub    | Layer 1   | Bits          |
| Switch | Layer 2   | MAC addresses |
| Router | Layer 3   | IP addresses  |

---

## Cables

### RJ-45 — the 4 pins that matter

```
Pin 1 — TX+   Pin 2 — TX−   (Transmit)
Pin 3 — RX+   Pin 6 — RX−   (Receive)
```

For communication to work: TX on one side must connect to RX on the other.

### Port types

| Type  | Device               | Transmits on | Receives on |
| ----- | -------------------- | ------------ | ----------- |
| MDI   | PC, Laptop  , Router | 1 & 2        | 3 & 6       |
| MDI-X | Switch, Hub          | 3 & 6        | 1 & 2       |

### The rule

```
MDI  ←→ MDI-X  →  Straight-through  (opposite types, swap in device)
MDI  ←→ MDI    →  Crossover         (same type, cable does the swap)
MDI-X ←→ MDI-X →  Crossover         (same type, cable does the swap)
```

### Straight-through

```
PC (MDI)                   Switch (MDI-X)
TX+ pin1 ────────────────── pin1 RX+
TX− pin2 ────────────────── pin2 RX−
RX+ pin3 ────────────────── pin3 TX+
RX− pin6 ────────────────── pin6 TX−
```

### Crossover

```
PC A (MDI)                 PC B (MDI)
TX+ pin1 ──────╮─────────── pin3 RX+
TX− pin2 ────╮─╰─────────── pin6 RX−
RX+ pin3 ────╰───────────── pin1 TX+
RX− pin6 ──────────────────  pin2 TX−
```

### Reference

| Connection      | Cable                  |
| --------------- | ---------------------- |
| PC → Switch     | Straight-through       |
| PC → Router     | Crossover              |
| PC → PC         | Crossover              |
| Switch → Switch | Crossover              |
| Switch → Router | Straight-through       |
| Modern devices  | Either (Auto-MDI/MDIX) |

### Auto-MDI/MDIX

Modern devices (post-2001) detect cable type automatically and swap
TX/RX internally. Handled by the PHY chip at hardware level before
any software runs. Makes crossover cables obsolete for modern equipment.

---

## Devices

### Hub — Layer 1

A hub is a dumb repeater. Any signal received on one port is
copied to ALL other ports immediately.

```
PC-A sends to PC-C → hub sends to PC-B, PC-C, PC-D all at once
PC-B and PC-D receive it and must discard it → waste
```

- Half-duplex — send OR receive, never both
- One collision domain — all devices share the same bandwidth
- Uses CSMA/CD to handle collisions

**CSMA/CD process:**
```
1. Listen before sending (is the wire free?)
2. Send data
3. Collision detected → all stop → wait random time → retry
```

### Switch — Layer 2

A switch learns MAC addresses and forwards frames only to the
correct port. Each port is its own collision domain.

```
PC-A sends to PC-C → switch sends ONLY to PC-C
PC-B and PC-D hear nothing → efficient + private
```

- Full-duplex — send AND receive simultaneously
- Builds a MAC address table (CAM table) by learning source MACs
- On first contact: floods like a hub, then learns and forwards

**MAC table learning:**
```
Frame arrives on port 1 from MAC AA:BB:CC
Switch records: AA:BB:CC → port 1
Next frame to AA:BB:CC → sent directly to port 1 only
```

### Router — Layer 3

A router connects different networks and forwards packets based
on destination IP address.

```
Switch  →  connects devices INSIDE one network
Router  →  connects DIFFERENT networks together
```

**Packet forwarding:**
```
1. Packet arrives with destination IP
2. Router checks routing table (longest prefix match)
3. Decrements TTL by 1
4. Rewrites MAC address (new src=router, dst=next hop)
5. Forwards out correct interface
```

IP address never changes hop to hop (unless NAT).
MAC address changes at every hop.

**Routing table:**
```
Destination      Mask               Gateway        Interface
192.168.1.0      255.255.255.0      direct         Gi0/0
10.0.0.0         255.0.0.0          direct         Gi0/1
0.0.0.0          0.0.0.0            10.0.0.1       Gi0/2  ← default
```

`0.0.0.0/0` = default route → send here if nothing else matches (internet).

---

## IP Addressing & Subnetting

### Subnet formula

```
Block size  =  2^(32 - prefix)
Usable IPs  =  block size - 2
Network     =  floor(IP ÷ block size) × block size
Broadcast   =  network + block size - 1
```

### Finding your block — example: 111.111.111.83/29

```
Step 1 — block size:    32 - 29 = 3 host bits → 2³ = 8
Step 2 — divide:        83 ÷ 8 = 10.375
Step 3 — drop decimal:  10
Step 4 — multiply:      10 × 8 = 80  ← network address
Step 5 — broadcast:     80 + 8 - 1 = 87
```

```
111.111.111.80  → network    (cannot assign)
111.111.111.81  → host ✓
111.111.111.82  → host ✓
111.111.111.83  → host ✓  ← your IP
111.111.111.84  → host ✓
111.111.111.85  → host ✓
111.111.111.86  → host ✓
111.111.111.87  → broadcast  (cannot assign)
```

### Common subnet reference

```
Prefix  Mask                 Block   Usable
/25     255.255.255.128        128      126
/26     255.255.255.192         64       62
/27     255.255.255.224         32       30
/28     255.255.255.240         16       14
/29     255.255.255.248          8        6
/30     255.255.255.252          4        2
/31     255.255.255.254          2        0 (or 2 point-to-point)
/32     255.255.255.255          1        1 (single host)
```

---

## Protocols

### Protocol & Port Reference

| Protocol | Port  | Transport | Layer | Purpose                      |
| -------- | ----- | --------- | ----- | ---------------------------- |
| DHCP     | 67/68 | UDP       | L7    | Automatic IP assignment      |
| DNS      | 53    | UDP/TCP   | L7    | Name → IP resolution         |
| HTTP     | 80    | TCP       | L7    | Web (unencrypted)            |
| HTTPS    | 443   | TCP       | L7    | Web (TLS encrypted)          |
| FTP      | 20/21 | TCP       | L7    | File transfer                |
| RIP      | 520   | UDP       | L7    | Dynamic routing (small nets) |
| ARP      | —     | —         | L2/3  | IP → MAC resolution          |
| ICMP     | —     | IP proto  | L3    | Ping, traceroute, errors     |
| OSPF     | —     | IP 89     | L3    | Dynamic routing (enterprise) |

### TCP vs UDP

```
TCP  →  connection-oriented, reliable, ordered, slower
         handshake before data, confirms every packet
         used by: HTTP, HTTPS, FTP

UDP  →  connectionless, no guarantee, faster
         fire and forget — no confirmation
         used by: DHCP, DNS, RIP
```

Both operate at Layer 4 (Transport).

---

### ARP — Address Resolution Protocol

Converts IP → MAC. Required before any frame can be sent.

```
PC1 wants to reach 192.168.1.20
PC1 checks ARP cache → not found
PC1 broadcasts: "Who has 192.168.1.20?"    (FF:FF:FF:FF:FF:FF)
192.168.1.20 replies: "I do — AA:BB:CC:DD:EE:FF"  (unicast)
PC1 stores result in ARP cache → sends frame
```

```
Same subnet  →  ARP for destination IP
Other subnet →  ARP for default gateway IP (router handles the rest)
```

---

### ICMP — Internet Control Message Protocol

Used for error messages and connectivity testing. Not for data transfer.

```
Type 0   Echo Reply           →  ping response
Type 8   Echo Request         →  ping request
Type 3   Destination Unreachable → cannot reach host
Type 11  Time Exceeded        →  TTL = 0 (traceroute uses this)
```

**How traceroute works:**
```
TTL=1 → Router1 drops it → sends Time Exceeded → we see Router1 IP
TTL=2 → Router2 drops it → sends Time Exceeded → we see Router2 IP
TTL=3 → destination reached → Echo Reply → done
```

---

### DHCP — Dynamic Host Configuration Protocol

Automatically assigns full network config to every device.

**DORA handshake:**
```
D — DISCOVER    broadcast  "I need an IP"         src=0.0.0.0
O — OFFER       unicast    "I offer 192.168.1.10"
R — REQUEST     broadcast  "I accept 192.168.1.10"
A — ACKNOWLEDGE unicast    "It's yours"
```

Client uses broadcast because it has no IP yet.

**What DHCP assigns:**
```
IP address, subnet mask, default gateway, DNS server, lease time
```

**Lease renewal:**
```
At  50%  →  renew with same server (unicast)
At  87.5% →  broadcast to any server
At 100%  →  release IP, DORA restarts
```

---

### DNS — Domain Name System

Translates domain names to IP addresses.

```
You type google.com → DNS returns 142.250.185.46 → browser connects
```

**Resolution flow:**
```
Browser → Recursive Resolver → Root → TLD → Authoritative → IP
```

**Record types:**
```
A      domain → IPv4           main address record
AAAA   domain → IPv6           IPv6 address
CNAME  alias  → real name      www → domain
MX     domain → mail server    email routing
NS     domain → nameserver     who is authoritative
PTR    IP     → domain         reverse lookup
TXT    domain → text           SPF, DKIM, verification
SOA    zone   → authority      timers + admin (required)
```

**In Exercise 3:**
```
deep-in-net.local → 192.168.1.99     (A record)
deep-in-net.com   → deep-in-net.local (CNAME record)
```

---

### FTP — File Transfer Protocol

Transfers files between client and server.

```
Port 21  →  control (commands)
Port 20  →  data    (file transfer)
```

**Commands:**
```
dir     list files         get <file>  download
cd      change directory   put <file>  upload
pwd     current directory  delete      delete file
passive switch to passive  quit        disconnect
```

**Response codes:**
```
220  server ready      230  logged in       226  transfer done
331  send password     530  wrong login     550  file not found
```

**Permissions (RWDNL):**
```
R read  W write  D delete  N rename  L list

RL     →  read only (guest)
RWDNL  →  full access (admin)
```

**Active vs Passive:**
```
Active   →  server connects back to client  (blocked by firewalls)
Passive  →  client opens all connections    (use this in production)
```

---

### HTTP & HTTPS

```
HTTP   →  plain text   port 80   insecure
HTTPS  →  TLS encrypted port 443  secure
```

**TLS handshake:**
```
1. Client Hello   →  supported TLS versions + cipher suites
2. Server Hello   →  chosen cipher + certificate
3. Verify cert    →  check CA signature, domain, expiry
4. Key exchange   →  encrypted pre-master secret sent
5. Session key    →  both sides derive same key independently
6. Finished       →  tunnel confirmed
7. Data flows     →  all HTTP encrypted from here
```

**HTTP response codes:**
```
200 OK          201 Created       301 Moved permanently
302 Found       400 Bad request   401 Unauthorized
403 Forbidden   404 Not found     500 Internal error
```

---

### Routing Protocols

#### RIP — Routing Information Protocol

```
Type        Distance Vector
Metric      hop count
Max hops    15  (16 = unreachable)
Updates     full table every 30 seconds
Port        UDP 520
Best for    small networks / labs
```

**Config:**
```
router rip
 version 2
 network 192.168.1.0
 no auto-summary
```

#### OSPF — Open Shortest Path First

```
Type        Link State
Metric      cost (100Mbps / bandwidth)
Max hops    unlimited
Updates     only on topology change
Port        IP protocol 89
Best for    enterprise networks
```

**Cost examples:**
```
FastEthernet (100Mbps) → cost 1
Ethernet (10Mbps)      → cost 10
Serial (1.544Mbps)     → cost 64
```

**Config:**
```
router ospf 1
 network 192.168.1.0 0.0.0.255 area 0
 network 10.0.0.0 0.0.0.3 area 0
```

Note: OSPF uses wildcard masks (inverse of subnet mask).

#### RIP vs OSPF

```
Feature       RIP              OSPF
────────────────────────────────────────
Type          Distance Vector  Link State
Metric        Hop count        Bandwidth
Max hops      15               Unlimited
Convergence   Slow (minutes)   Fast (seconds)
Updates       Every 30s        On change only
Scale         Small only       Enterprise
```

---

### NAT — Network Address Translation

Lets many private IPs share one public IP.

```
192.168.1.10 ──┐
192.168.1.11 ──┤── Router NAT ── 203.0.113.5 ── Internet
192.168.1.12 ──┘
```

```
Static NAT  →  one private = one public  (servers)
PAT         →  many private = one public via ports  (home router)
```

### ACL — Access Control List

Rules on a router interface to permit or deny traffic.

```
Standard ACL (1-99)    →  filter by source IP only
Extended ACL (100-199) →  filter by src + dst + protocol + port
```

Rules read top to bottom. First match wins.
Implicit `deny all` at the end — unmatched packets dropped.

```
Rule 1: DENY   tcp 192.168.1.50 any port 80
Rule 2: PERMIT ip  any          any
        (implicit DENY all)
```

---

## Routing

### Static vs Dynamic

```
Static   →  admin adds routes manually
             simple, predictable, no overhead
             does not adapt if link fails

Dynamic  →  routers share routes automatically
             adapts when topology changes
             RIP or OSPF
```

### Serial — Point-to-Point WAN

Connects exactly two routers over a long-distance WAN link.

**DCE and DTE:**
```
DCE  →  provides clock signal (ISP side in real life)
DTE  →  receives clock (your router)
```

In Packet Tracer: the router with the clock icon = DCE.
Must configure `clock rate` on DCE only.

**Clock signal:** an electrical pulse that defines the rhythm.
Each pulse = one bit. `clock rate 64000` = 64,000 bits/sec.

**`no shutdown`:** every Cisco interface is OFF by default.
Must enable manually. `no` in IOS = undo what follows.

**Full config:**
```
-- DCE router --
interface Serial0/0/0
 ip address 10.0.0.1 255.255.255.252
 clock rate 64000
 no shutdown

-- DTE router --
interface Serial0/0/0
 ip address 10.0.0.2 255.255.255.252
 no shutdown
```

**Encapsulation:**
```
HDLC  →  Cisco default, proprietary (Cisco-to-Cisco only)
PPP   →  open standard, works between any vendor, supports auth
```

---

## Exercises

### Exercise 1 — Direct PC Communication

**Goal:** PC0↔PC1, PC2↔PC3, PC4↔PC5

**Cable:** Crossover (PC to PC = MDI to MDI)

**Config:** Static IPs on each PC, same subnet per pair.

---

### Exercise 2 — Switch vs Hub

**Goal:** All PCs on switch communicate. All PCs on hub communicate.

**Switch group:** unicast, no collision, full-duplex
**Hub group:** broadcast to all, collisions possible, half-duplex

**OSI layers:** Hub = Layer 1 | Switch = Layer 2

---

### Exercise 3 — Network Services

**Goal:** DHCP assigns IPs. DNS resolves names. HTTPS serves hello page. FTP accepts uploads.

| Server | IP           | Service             |
| ------ | ------------ | ------------------- |
| DHCP   | 192.168.1.1  | IP assignment       |
| DNS    | 192.168.1.2  | Name resolution     |
| HTTPS  | 192.168.1.99 | Web (HTTP disabled) |
| FTP    | 192.168.1.4  | File transfer       |

**DNS records:**
```
deep-in-net.local → 192.168.1.99     A record
deep-in-net.com   → deep-in-net.local CNAME record
```

**FTP user:** `deepinnet` with `RWDNL` permissions

**Test:** Browse `https://deep-in-net.com` from any PC → hello page appears.

---

### Exercise 4 — Router Basics

**Goal:** Two PCs on different subnets communicate via router.

**Concepts:** Default gateway, inter-subnet routing, Layer 3 forwarding.

---

### Exercise 5 — Two Subnets via Router

**Goal:** Full communication between two subnets with multiple PCs each.

```
Subnet 1: 192.168.1.0/24  gateway 192.168.1.1
Subnet 2: 192.168.2.0/24  gateway 192.168.2.1
```

---

### Exercise 6 — Static Routing

**Goal:** Two PCs on different subnets, two routers in between.

```
R1: ip route 192.168.2.0 255.255.255.0 10.0.0.2
R2: ip route 192.168.1.0 255.255.255.0 10.0.0.1
```

**Troubleshoot hop by hop:**
```
PC1> ping 192.168.1.1    gateway reachable?
R1#  ping 10.0.0.2       serial link up?
R1#  ping 192.168.2.10   full path works?
```

---

### Exercise 7 — Multi-device Routing

**Goal:** Multiple PCs per subnet, two subnets, full communication.

Same as Exercise 5 with more devices per switch.

---

### Exercise 8 — Three-Subnet Full Mesh

**Goal:** All PCs across 3 subnets can reach each other.

| Subnet   | Network        | Gateway     |
| -------- | -------------- | ----------- |
| Subnet 1 | 192.168.1.0/24 | 192.168.1.1 |
| Subnet 2 | 192.168.2.0/24 | 192.168.2.1 |
| Subnet 3 | 192.168.3.0/24 | 192.168.3.1 |

Each router needs static routes to both other subnets.

---

## File Structure

```
deep-in-net/
├── ex01.pkt    direct PC pairs
├── ex02.pkt    switch and hub
├── ex03.pkt    DHCP, DNS, HTTPS, FTP servers
├── ex04.pkt    basic router
├── ex05.pkt    two subnets
├── ex06.pkt    static routing two routers
├── ex07.pkt    multi-device routing
├── ex08.pkt    three-subnet full mesh
└── README.md   this file
```

---

> "Networking plays a critical role in various IT specialties,
> and is particularly essential for cloud and DevOps engineering.
> Be curious and never stop searching!"