;; algorithm-registry contract

(define-data-var next-algorithm-id uint u0)

(define-map algorithms
  uint
  {
    name: (string-ascii 64),
    description: (string-utf8 256),
    author: principal,
    votes: uint,
    status: (string-ascii 20)
  }
)

(define-public (submit-algorithm (name (string-ascii 64)) (description (string-utf8 256)))
  (let
    (
      (algorithm-id (var-get next-algorithm-id))
    )
    (map-set algorithms algorithm-id {
      name: name,
      description: description,
      author: tx-sender,
      votes: u0,
      status: "submitted"
    })
    (var-set next-algorithm-id (+ algorithm-id u1))
    (ok algorithm-id)
  )
)

(define-read-only (get-algorithm (algorithm-id uint))
  (map-get? algorithms algorithm-id)
)

(define-public (vote-for-algorithm (algorithm-id uint))
  (match (map-get? algorithms algorithm-id)
    algorithm (begin
      (map-set algorithms algorithm-id
        (merge algorithm { votes: (+ (get votes algorithm) u1) })
      )
      (ok true)
    )
    (err u404)
  )
)

