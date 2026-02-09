import { motion } from "framer-motion";

export default function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-ink text-white">
      <div className="mx-auto w-full max-w-5xl px-4 pb-24 pt-10 sm:px-8">
        {/* Header Skeleton */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-soft"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <motion.div
                className="h-4 w-24 rounded-full bg-white/10"
                animate={{
                  background: [
                    "linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 100%)",
                    "linear-gradient(90deg, rgba(255,255,255,0.1) 100%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 0%)",
                  ],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className="mt-4 h-8 w-32 rounded-2xl bg-white/10"
                animate={{
                  background: [
                    "linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 100%)",
                    "linear-gradient(90deg, rgba(255,255,255,0.1) 100%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 0%)",
                  ],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.2,
                }}
              />
            </div>
            <motion.div
              className="glass-card flex min-w-[190px] flex-col gap-3 rounded-3xl px-4 py-3 text-xs"
              animate={{
                background: [
                  "rgba(255,255,255,0.05)",
                  "rgba(255,255,255,0.1)",
                  "rgba(255,255,255,0.05)",
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <div className="h-4 w-20 rounded-full bg-white/10" />
              <div className="h-4 w-16 rounded-full bg-white/10" />
              <div className="h-3 w-24 rounded-full bg-white/10" />
            </motion.div>
          </div>
        </motion.div>

        {/* Stats Grid Skeleton */}
        <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          {/* Weekly Totals Skeleton */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="glass-card rounded-3xl p-6 shadow-soft"
          >
            <div className="flex items-center justify-between">
              <motion.div
                className="h-6 w-32 rounded-full bg-white/10"
                animate={{
                  background: [
                    "linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 100%)",
                    "linear-gradient(90deg, rgba(255,255,255,0.1) 100%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 0%)",
                  ],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className="h-4 w-20 rounded-full bg-white/10"
                animate={{
                  background: [
                    "linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 100%)",
                    "linear-gradient(90deg, rgba(255,255,255,0.1) 100%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 0%)",
                  ],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.4,
                }}
              />
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="rounded-3xl border border-white/10 bg-white/5 p-4"
                  animate={{
                    borderColor: [
                      "rgba(255,255,255,0.1)",
                      "rgba(255,255,255,0.2)",
                      "rgba(255,255,255,0.1)",
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.2,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <motion.div
                        className="h-3 w-16 rounded-full bg-white/10"
                        animate={{
                          background: [
                            "linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 100%)",
                            "linear-gradient(90deg, rgba(255,255,255,0.1) 100%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 0%)",
                          ],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: i * 0.3,
                        }}
                      />
                      <motion.div
                        className="mt-2 h-5 w-24 rounded-full bg-white/10"
                        animate={{
                          background: [
                            "linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 100%)",
                            "linear-gradient(90deg, rgba(255,255,255,0.1) 100%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 0%)",
                          ],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: i * 0.4,
                        }}
                      />
                    </div>
                    <motion.div
                      className="h-6 w-6 rounded-full bg-white/10"
                      animate={{
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.2,
                      }}
                    />
                  </div>
                  <div className="mt-4 flex items-baseline justify-between">
                    <motion.div
                      className="h-8 w-12 rounded-full bg-white/10"
                      animate={{
                        background: [
                          "linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 100%)",
                          "linear-gradient(90deg, rgba(255,255,255,0.1) 100%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 0%)",
                        ],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.3,
                      }}
                    />
                    <motion.div
                      className="h-3 w-8 rounded-full bg-white/10"
                      animate={{
                        background: [
                          "linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 100%)",
                          "linear-gradient(90deg, rgba(255,255,255,0.1) 100%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 0%)",
                        ],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.4,
                      }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Weekly Status Skeleton */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="glass-card rounded-3xl p-6 shadow-soft"
          >
            <div className="flex items-start justify-between">
              <div>
                <motion.div
                  className="h-3 w-24 rounded-full bg-white/10"
                  animate={{
                    background: [
                      "linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 100%)",
                      "linear-gradient(90deg, rgba(255,255,255,0.1) 100%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 0%)",
                    ],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <motion.div
                  className="mt-2 h-6 w-32 rounded-full bg-white/10"
                  animate={{
                    background: [
                      "linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 100%)",
                      "linear-gradient(90deg, rgba(255,255,255,0.1) 100%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 0%)",
                    ],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.2,
                  }}
                />
                <motion.div
                  className="mt-2 h-3 w-40 rounded-full bg-white/10"
                  animate={{
                    background: [
                      "linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 100%)",
                      "linear-gradient(90deg, rgba(255,255,255,0.1) 100%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 0%)",
                    ],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.4,
                  }}
                />
              </div>
              <motion.div
                className="h-6 w-6 rounded-full bg-white/10"
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            </div>

            {/* Status Card Skeleton */}
            <motion.div
              className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-4"
              animate={{
                borderColor: [
                  "rgba(255,255,255,0.1)",
                  "rgba(255,255,255,0.3)",
                  "rgba(255,255,255,0.1)",
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <motion.div
                    className="h-3 w-16 rounded-full bg-white/10"
                    animate={{
                      background: [
                        "linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 100%)",
                        "linear-gradient(90deg, rgba(255,255,255,0.1) 100%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 0%)",
                      ],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  <motion.div
                    className="mt-2 h-5 w-36 rounded-full bg-white/10"
                    animate={{
                      background: [
                        "linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 100%)",
                        "linear-gradient(90deg, rgba(255,255,255,0.1) 100%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 0%)",
                      ],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.2,
                    }}
                  />
                </div>
                <motion.div
                  className="h-8 w-8 rounded-2xl bg-white/10"
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>
              <motion.div
                className="mt-2 h-3 w-48 rounded-full bg-white/10"
                animate={{
                  background: [
                    "linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 100%)",
                    "linear-gradient(90deg, rgba(255,255,255,0.1) 100%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 0%)",
                  ],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.3,
                }}
              />
            </motion.div>

            {/* Head-to-Head Skeleton */}
            <motion.div
              className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-4"
              animate={{
                borderColor: [
                  "rgba(255,255,255,0.1)",
                  "rgba(255,255,255,0.2)",
                  "rgba(255,255,255,0.1)",
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.3,
              }}
            >
              <motion.div
                className="h-3 w-32 rounded-full bg-white/10"
                animate={{
                  background: [
                    "linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 100%)",
                    "linear-gradient(90deg, rgba(255,255,255,0.1) 100%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 0%)",
                  ],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <div className="mt-3 space-y-2">
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    className="flex items-center justify-between"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <motion.div
                      className="h-4 w-20 rounded-full bg-white/10"
                      animate={{
                        background: [
                          "linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 100%)",
                          "linear-gradient(90deg, rgba(255,255,255,0.1) 100%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 0%)",
                        ],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.2,
                      }}
                    />
                    <motion.div
                      className="h-4 w-12 rounded-full bg-white/10"
                      animate={{
                        background: [
                          "linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 100%)",
                          "linear-gradient(90deg, rgba(255,255,255,0.1) 100%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 0%)",
                        ],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.3,
                      }}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Daily Breakdown Skeleton */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-6 glass-card rounded-3xl p-6 shadow-soft"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <motion.div
              className="h-6 w-32 rounded-full bg-white/10"
              animate={{
                background: [
                  "linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 100%)",
                  "linear-gradient(90deg, rgba(255,255,255,0.1) 100%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 0%)",
                ],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="h-10 w-32 rounded-xl bg-white/10"
              animate={{
                background: [
                  "linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 100%)",
                  "linear-gradient(90deg, rgba(255,255,255,0.1) 100%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 0%)",
                ],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.2,
              }}
            />
          </div>

          <div className="mt-6 flex flex-col gap-4">
            {[1, 2].map((dayIndex) => (
              <motion.div
                key={dayIndex}
                className="rounded-3xl border border-white/10 bg-white/5 p-4"
                animate={{
                  borderColor: [
                    "rgba(255,255,255,0.1)",
                    "rgba(255,255,255,0.25)",
                    "rgba(255,255,255,0.1)",
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: dayIndex * 0.2,
                }}
              >
                <motion.div
                  className="h-3 w-24 rounded-full bg-white/10"
                  animate={{
                    background: [
                      "linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 100%)",
                      "linear-gradient(90deg, rgba(255,255,255,0.1) 100%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 0%)",
                    ],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: dayIndex * 0.3,
                  }}
                />
                <div className="mt-4 flex flex-col gap-3">
                  {[1, 2].map((entryIndex) => (
                    <motion.div
                      key={entryIndex}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                      animate={{
                        background: [
                          "rgba(255,255,255,0.05)",
                          "rgba(255,255,255,0.1)",
                          "rgba(255,255,255,0.05)",
                        ],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: (dayIndex + entryIndex) * 0.1,
                      }}
                    >
                      <div>
                        <motion.div
                          className="h-4 w-24 rounded-full bg-white/10"
                          animate={{
                            background: [
                              "linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 100%)",
                              "linear-gradient(90deg, rgba(255,255,255,0.1) 100%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 0%)",
                            ],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: (dayIndex + entryIndex) * 0.2,
                          }}
                        />
                        <motion.div
                          className="mt-1 h-3 w-16 rounded-full bg-white/10"
                          animate={{
                            background: [
                              "linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 100%)",
                              "linear-gradient(90deg, rgba(255,255,255,0.1) 100%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 0%)",
                            ],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: (dayIndex + entryIndex) * 0.3,
                          }}
                        />
                      </div>
                      <motion.div
                        className="h-6 w-6 rounded-full bg-white/10"
                        animate={{
                          scale: [1, 1.2, 1],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: (dayIndex + entryIndex) * 0.1,
                        }}
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* New Entry Section Skeleton */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-6 glass-card rounded-3xl p-6 shadow-soft"
        >
          <div className="flex items-center justify-between">
            <div>
              <motion.div
                className="h-3 w-20 rounded-full bg-white/10"
                animate={{
                  background: [
                    "linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 100%)",
                    "linear-gradient(90deg, rgba(255,255,255,0.1) 100%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 0%)",
                  ],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className="mt-2 h-5 w-24 rounded-full bg-white/10"
                animate={{
                  background: [
                    "linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 100%)",
                    "linear-gradient(90deg, rgba(255,255,255,0.1) 100%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 0%)",
                  ],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.2,
                }}
              />
            </div>
            <motion.div
              className="h-10 w-24 rounded-2xl bg-white/10"
              animate={{
                background: [
                  "linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 100%)",
                  "linear-gradient(90deg, rgba(255,255,255,0.1) 100%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 0%)",
                ],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.3,
              }}
            />
          </div>
        </motion.div>
      </div>

      {/* Bottom Nav Skeleton */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="fixed bottom-4 left-1/2 z-40 w-[92%] max-w-sm -translate-x-1/2 rounded-3xl border border-white/10 bg-white/10 px-6 py-4 backdrop-blur-xl"
      >
        <div className="flex items-center justify-between">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="h-4 w-20 rounded-full bg-white/10"
              animate={{
                background: [
                  "linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 100%)",
                  "linear-gradient(90deg, rgba(255,255,255,0.1) 100%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 0%)",
                ],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.1,
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
