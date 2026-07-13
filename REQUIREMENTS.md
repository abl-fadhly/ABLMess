# ABLMess Requirements

## What is this?

<!-- One or two sentences: what does ABLMess manage, and for whom? -->
This is a web application for GS admin to manage mess (crew lodging) for crew. V1 is web-only, built mobile-friendly (responsive) so it's usable from a phone browser without a native app.

## Goals

<!-- What must be true when this is done? -->
GS can add crew, manages room, see room logs, and if a room is full GS can record (as structured, queryable data) that the crew was placed in an outside hotel — visible later in logs. All users required to be login to do anything. System prevents overbooking a room beyond its capacity.

## Non-Goals

<!-- What is explicitly out of scope, at least for v1? -->
- SSO
- Native mobile app (web is mobile-friendly/responsive instead)
- Crew self-service "forgot password" flow (deferred; GS resets passwords for now)


## Tech Stack

- Database: PostgreSQL
- Backend: .NET (C#), Entity Framework Core for schema/migrations
- Primary keys: auto-increment integers

## Users & Roles

<!-- Who uses this, and what can each role do? -->
There are 3 types of role :
Admin, GS, and Crew

Admin can do all.

GS can :
- View a dashboard showing: current occupancy overview (available/occupied/full per location), upcoming check-ins/check-outs, pending requests not yet booked or placed, and crew currently in outside hotels
- Book a room based on crew request
- see all crew logs
- see rooms logs
- record when a crew member had to be placed in an outside hotel (if the room is full), as structured data visible in logs
- manages a user(add, edit, delete, reset password)
- add, edit, delete room and location
- add, edit, delete ship information
- add, edit, delete Jabatan

Crew :
- Request a room
- see his/her own room history
- manages his own profile and password
- receives email notifications: when their request is booked, H-1 reminder before clock-in, H-1 reminder before clock-out

## Notifications

<!-- What events trigger a notification, to whom, and via what channel? -->
- Channel: Email only (v1)
- Recipient: Crew only (the requester)
- Triggers:
  - Request booked (Request status → Booked)
  - H-1 reminder: one day before Booking.From (upcoming clock-in)
  - H-1 reminder: one day before Booking.To (upcoming clock-out)
- Sent notifications are logged (TbNotification) so GS/Admin can verify a crew member was actually notified.


## Core Entities

<!-- The main things the system tracks (e.g. crew, mess rooms, meals, bookings) -->
Database :

TbUser
Id, First Name, Last Name, Gender, Ship Id, Jabatan Id, Phone, Password, UserType, Email, CreatedAt, UpdatedAt
- Gender is tracked for reference/reporting only — not enforced by the system when assigning rooms/beds (GS's judgment call).

TbJabatan
Id, Nama Jabatan
(Informational only — does not affect room eligibility/priority)

TbShip
Id, Ship Name

TbLocation
Id, Location Name, Location Address, CreatedAt, UpdatedAt

TbRoom
Id, Room Name, Location Id, Status(Empty, Occupied, Full), CreatedAt, UpdatedAt
- Capacity is not a stored field — it's derived from the count of TbBed rows for the room.
- Status is auto-computed by the system from bed occupancy (Empty = no beds booked, Occupied = some beds booked, Full = all beds booked), not manually set by GS.

TbBed
Id, Room Id, Bed Name, CreatedAt, UpdatedAt
- A bed's occupied/available state is not a stored field — it's derived from whether it has an active booking for the given dates.

TbRequest
Id, UserId, From, To, Status(Requested, Booked, Placed, Cancelled), Comment, CreatedAt, UpdatedAt
- Placed = fulfilled via TbHotelPlacement (outside hotel) instead of a mess room booking.

TbBooking
Id, Request Id, Bed Id, From, To, Status(Booked, Clock-In, Clock-Out, Cancelled), CreatedAt, UpdatedAt
- Booking is against a specific bed (not just a room) — GS picks which bed within the room when booking.
- Request Id is the single FK linking Booking back to Request (no reverse FK on TbRequest).
- System must reject a booking for a bed that already has an overlapping active booking for the requested date range (no double-booking a bed, which in turn prevents overbooking the room).
- Clock-In and Clock-Out are set manually by GS (not crew self-service).
- When a Booking is set to Cancelled, its linked Request is also set to Cancelled.

TbHotelPlacement
Id, Request Id, Hotel Name, Hotel Address, From, To, Notes, CreatedBy (UserId), CreatedAt
- Used when a crew's request can't be fulfilled by a mess room (room full) and GS places them in an outside hotel instead. Queryable/reportable, shows up in logs.

TbNotification
Id, UserId, Booking Id (nullable), Request Id (nullable), Type(RequestBooked, ClockInReminder, ClockOutReminder), Channel(Email), SentAt, Success
- One row per notification attempt, for audit/troubleshooting.

## Open Questions

<!-- TODO: anything undecided yet -->
- Crew self-service password reset ("forgot password") flow — deferred, to be defined later.
- Whether a crew member should be blocked from having overlapping active Requests/Bookings — not enforced in v1, revisit if it causes real issues.
