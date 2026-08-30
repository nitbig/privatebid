# PrivateBid

### Bid privately. Verify publicly.

> A privacy-preserving sealed-bid procurement platform built with Midnight.

PrivateBid enables organizations to run digital procurement auctions where **bid values remain confidential while the final outcome can be verified**.

[Live Demo](https://privatebid.netlify.app/) · [GitHub](https://github.com/nitbig/privatebid/)

---

## Why PrivateBid?

Traditional online procurement has a fundamental problem:

**How do you prove that an auction was fair without exposing every bidder's price?**

In conventional systems, bid information is typically stored by a centralized platform. This creates several risks:

- Competitors may gain access to sensitive pricing information.
- Late bidders can strategically undercut earlier bids.
- A compromised database can expose confidential tenders.
- Participants must trust the platform operator to honestly execute the auction.
- Auditors can verify the final result only by trusting the underlying system.

For infrastructure contracts and high-value procurement, **bid confidentiality is not a feature — it is part of the integrity of the process.**

---

# The Solution

**PrivateBid** is a privacy-preserving sealed-bid auction framework for digital procurement.

The core idea is simple:

```text
             TRADITIONAL AUCTION

     Bid A ─────┐
     Bid B ─────┼──> Public / Centralized System
     Bid C ─────┘
                       │
                       ▼
                Sensitive prices
                     exposed


                  PRIVATEBID

     Bid A ─────┐
     Bid B ─────┼──> Private computation
     Bid C ─────┘          │
                           ▼
                    Verified result
                           │
                           ▼
                Winning result public
                Losing bids private
