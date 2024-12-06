;; bounty-manager contract

(define-data-var next-bounty-id uint u0)

(define-map bounties
  uint
  {
    title: (string-ascii 64),
    description: (string-utf8 256),
    amount: uint,
    status: (string-ascii 20),
    claimer: (optional principal)
  }
)

(define-public (create-bounty (title (string-ascii 64)) (description (string-utf8 256)) (amount uint))
  (let
    (
      (bounty-id (var-get next-bounty-id))
    )
    (map-set bounties bounty-id {
      title: title,
      description: description,
      amount: amount,
      status: "open",
      claimer: none
    })
    (var-set next-bounty-id (+ bounty-id u1))
    (ok bounty-id)
  )
)

(define-public (claim-bounty (bounty-id uint))
  (match (map-get? bounties bounty-id)
    bounty (begin
      (asserts! (is-eq (get status bounty) "open") (err u403))
      (map-set bounties bounty-id
        (merge bounty {
          status: "claimed",
          claimer: (some tx-sender)
        })
      )
      (ok true)
    )
    (err u404)
  )
)

(define-read-only (get-bounty (bounty-id uint))
  (map-get? bounties bounty-id)
)

