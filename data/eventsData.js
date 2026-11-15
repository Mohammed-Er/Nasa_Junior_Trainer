/**
 * ARES: The Last Signal - Complete Events & Story Registry (v3)
 * 
 * Tuned with balance_prototype.mjs math and Grade 4-5 kid-friendly language.
 * Sentences <= 18 words. Choice labels <= 6 words with verb first.
 * Every choice has a plain-language explanation and a real cost.
 */

export const EVENTS_DATA = {
  // =========================================================================
  // THE 8 DESIGNATED RANDOM EVENTS
  // =========================================================================

  // 1. Dust Devil on the Solar Panels (Eligible: Sol 3)
  "evt_solar_dust": {
    id: "evt_solar_dust",
    title: "Dust Devil on the Solar Panels",
    type: "random",
    eligibleSlots: [3],
    chapter: 1,
    dangerLevel: "low",
    radiationAffecting: false,
    intro: "A dust devil rolled right over our solar panels. Now thick red dust blocks the sunlight.",
    crewAdvice: {
      speaker: "Marcus Vance",
      role: "Systems & Power Engineer",
      text: "Dusty panels make less power. But walking outside takes energy."
    },
    choices: [
      {
        id: "clean_panels",
        label: "Brush the panels clean",
        plain: "Marcus goes outside and sweeps the dust off.",
        deltas: { power: -2, lifeSupport: 0, radiationSafety: 0, morale: -2 },
        modifiers: [
          { resource: "power", perSol: 1, lengthInSols: 10, label: "Clean solar panels" }
        ],
        pendingEffects: [],
        flags: ["panels_cleaned"],
        objectiveChanges: {},
        outcomeText: "Marcus swept the panels clean. They sparkle in the sun and make extra electricity!",
        crewReaction: {
          speaker: "Marcus Vance",
          role: "Systems & Power Engineer",
          text: "My arms are tired, but the batteries are charging smoothly again."
        },
        science: {
          text: "Mars dust sticks to solar panels with static electricity, like a balloon sticking to your hair.",
          sourceId: "perseverance-dust-hazards",
          typeTag: "Science idea"
        }
      },
      {
        id: "wait_for_wind",
        label: "Wait for the wind",
        plain: "Stay inside and hope the Martian breeze blows the dust off.",
        deltas: { power: -1, lifeSupport: 0, radiationSafety: 0, morale: 1 },
        modifiers: [
          { resource: "power", perSol: -1, lengthInSols: 5, label: "Dusty solar panels" }
        ],
        pendingEffects: [],
        flags: ["waited_for_wind"],
        objectiveChanges: {},
        outcomeText: "The wind stayed quiet. The dust stayed put, cutting down our power for several days.",
        crewReaction: {
          speaker: "Commander Rivera",
          role: "Outpost Commander",
          text: "Mars wind is too thin to sweep panels clean on its own."
        },
        science: {
          text: "Mars air is very thin. Even fast winds have little pushing power against sticky dust.",
          sourceId: "nasa-mars-exploration-faq",
          typeTag: "Real NASA fact"
        }
      },
      {
        id: "study_dust",
        label: "Study the dust first",
        plain: "Dr. Al-Mansoor tests why the dust sticks before cleaning.",
        deltas: { power: -3, lifeSupport: 0, radiationSafety: 0, morale: 2 },
        pendingEffects: [
          {
            triggerInSols: 3,
            deltas: { power: 6, lifeSupport: 0, radiationSafety: 0, morale: 0 },
            cause: "Panel Dust Scientific Insight",
            callbackText: "Remember Sol 3? Studying the dust helped Marcus clean panels twice as fast! Power +6%."
          }
        ],
        modifiers: [],
        flags: ["panels_studied"],
        objectiveChanges: { panelsUnderstood: true },
        outcomeText: "Dr. Al-Mansoor found the magnetic grain size. His new cleaning trick pays off in three days!",
        crewReaction: {
          speaker: "Dr. Tariq Al-Mansoor",
          role: "Mission Scientist",
          text: "Curiosity solved it! Understanding the dust gave us a clever cleaning trick."
        },
        science: {
          text: "Martian dust contains magnetic iron minerals that cling firmly to glass surfaces.",
          sourceId: "perseverance-dust-hazards",
          typeTag: "Real NASA fact"
        }
      }
    ]
  },

  // 2. White Frost on the Rocks (Eligible: Sols 3, 6, 8)
  "evt_frost": {
    id: "evt_frost",
    title: "White Frost on the Rocks",
    type: "random",
    eligibleSlots: [3, 6, 8],
    chapter: 1,
    dangerLevel: "low",
    radiationAffecting: false,
    intro: "A thin white frost coats the red rocks outside our airlock window. The morning sun will melt it fast.",
    crewAdvice: {
      speaker: "Dr. Tariq Al-Mansoor",
      role: "Mission Scientist",
      text: "That frost vanishes in minutes. If we want samples, we must hurry outside."
    },
    choices: [
      {
        id: "collect_sample",
        label: "Collect a frost sample",
        plain: "Tariq suits up quickly and scoops the frost into sealed tubes.",
        deltas: { power: -3, lifeSupport: 0, radiationSafety: 0, morale: 3 },
        pendingEffects: [],
        modifiers: [],
        flags: ["frost_sampled"],
        objectiveChanges: { researchSamples: true },
        outcomeText: "Tariq brought in pure frost crystals before the sun evaporated them. The crew cheered!",
        crewReaction: {
          speaker: "Dr. Tariq Al-Mansoor",
          role: "Mission Scientist",
          text: "Look under the microscope! Dry ice and water ice frozen together!"
        },
        science: {
          text: "Frost on Mars is made of both frozen carbon dioxide (dry ice) and water ice.",
          sourceId: "nasa-mars-exploration-faq",
          typeTag: "Real NASA fact"
        }
      },
      {
        id: "window_photo",
        label: "Photo from the window",
        plain: "Take high-resolution photos through the thick glass window.",
        deltas: { power: -1, lifeSupport: 0, radiationSafety: 0, morale: 1 },
        pendingEffects: [],
        modifiers: [],
        flags: ["frost_photographed"],
        objectiveChanges: {},
        outcomeText: "The photos show the sparkling frost. Everyone stayed warm and safe inside.",
        crewReaction: {
          speaker: "Commander Rivera",
          role: "Outpost Commander",
          text: "Good pictures without risking an airlock cycle. Smart compromise."
        },
        science: {
          text: "Cameras on Mars rovers use color filters to spot water ice from a safe distance.",
          sourceId: "nasa-mars-exploration-faq",
          typeTag: "Real NASA fact"
        }
      },
      {
        id: "skip_frost",
        label: "Skip the frost",
        plain: "Ignore the frost and keep resting inside.",
        deltas: { power: 0, lifeSupport: 0, radiationSafety: 0, morale: -3 },
        pendingEffects: [],
        modifiers: [],
        flags: ["frost_ignored"],
        objectiveChanges: {},
        outcomeText: "The morning sun warmed the rocks. The frost vanished into gas, leaving no data.",
        crewReaction: {
          speaker: "Dr. Tariq Al-Mansoor",
          role: "Mission Scientist",
          text: "It disappeared into thin air. A missed chance for science."
        },
        science: {
          text: "Ice on Mars turns straight from solid into gas. This process is called sublimation.",
          sourceId: "nasa-mars-exploration-faq",
          typeTag: "Science idea"
        }
      }
    ]
  },

  // 3. Dust on Marcus's Suit (Eligible: Sols 6, 8, 11, 15)
  "evt_suit_dust": {
    id: "evt_suit_dust",
    title: "Dust on Marcus's Suit",
    type: "random",
    eligibleSlots: [6, 8, 11, 15],
    chapter: 2,
    dangerLevel: "medium",
    radiationAffecting: false,
    intro: "Marcus came in from a spacewalk covered in fine red powder. The airlock vacuum is humming.",
    crewAdvice: {
      speaker: "Dr. Hoshi Reed",
      role: "Medical Officer",
      text: "Mars dust has toxic salts. We cannot let it get into our breathing air."
    },
    choices: [
      {
        id: "deep_clean",
        label: "Full airlock cleaning",
        plain: "Run the full air wash and wipe down every suit crease.",
        deltas: { power: -3, lifeSupport: 0, radiationSafety: 0, morale: 0 },
        pendingEffects: [],
        modifiers: [],
        flags: ["suit_deep_cleaned"],
        objectiveChanges: {},
        outcomeText: "The air showers washed away every speck of dust. Our living quarters stay clean and safe.",
        crewReaction: {
          speaker: "Dr. Hoshi Reed",
          role: "Medical Officer",
          text: "Habitat air filters show zero dust. Our lungs thank you, Commander."
        },
        science: {
          text: "Mars dust contains perchlorate salts that can irritate human lungs and thyroid glands.",
          sourceId: "perseverance-dust-hazards",
          typeTag: "Real NASA fact"
        }
      },
      {
        id: "isolate",
        label: "Lock the suit away",
        plain: "Seal the dirty spacesuit inside an outer locker until tomorrow.",
        deltas: { power: -1, lifeSupport: 0, radiationSafety: 0, morale: -2 },
        pendingEffects: [],
        modifiers: [],
        flags: ["suit_isolated"],
        objectiveChanges: {},
        outcomeText: "The suit is locked in a sealed box. No spacewalks are possible until it is cleaned.",
        crewReaction: {
          speaker: "Marcus Vance",
          role: "Systems & Power Engineer",
          text: "My suit is quarantined, but at least the habitat air stayed fresh."
        },
        science: {
          text: "Future Mars suits may stay mounted to the outside wall so dust never enters the cabin.",
          sourceId: "perseverance-dust-hazards",
          typeTag: "Science idea"
        }
      },
      {
        id: "quick_brush",
        label: "Quick brush off",
        plain: "Brush the suit quickly by hand and skip the air wash.",
        deltas: { power: 0, lifeSupport: -2, radiationSafety: 0, morale: 0 },
        pendingEffects: [
          {
            triggerInSols: 3,
            deltas: { power: 0, lifeSupport: -6, radiationSafety: 0, morale: 0 },
            cause: "Airlock Dust Filter Clog",
            callbackText: "Remember the quick suit brush? Fine dust reached our air recyclers! Life Support -6%."
          }
        ],
        modifiers: [],
        flags: ["suit_quick_brushed"],
        objectiveChanges: {},
        outcomeText: "The suit looks clean, but fine red dust drifted into the air ducts.",
        crewReaction: {
          speaker: "Dr. Hoshi Reed",
          role: "Medical Officer",
          text: "I smell faint sulfur in the air. That dust is going to reach the filters soon."
        },
        science: {
          text: "Martian dust particles are smaller than smoke particles and easily slip past simple brushes.",
          sourceId: "perseverance-dust-hazards",
          typeTag: "Real NASA fact"
        }
      }
    ]
  },

  // 4. The Air That Disappeared Slowly (Eligible: Sols 8, 11, 15)
  "evt_oxygen_rate": {
    id: "evt_oxygen_rate",
    title: "The Air That Disappeared Slowly",
    type: "random",
    eligibleSlots: [8, 11, 15],
    chapter: 2,
    dangerLevel: "medium",
    radiationAffecting: false,
    intro: "Our air recycler says air is leaking out slowly. Nobody feels sick yet.",
    crewAdvice: {
      speaker: "Dr. Hoshi Reed",
      role: "Medical Officer",
      text: "It could be a tiny valve leak, or a broken gauge."
    },
    choices: [
      {
        id: "diagnostic",
        label: "Run a full check",
        plain: "Test every valve, pipe, and sensor in the air system.",
        deltas: { power: -2, lifeSupport: 8, radiationSafety: 0, morale: 0 },
        pendingEffects: [],
        modifiers: [],
        flags: ["oxygen_checked"],
        objectiveChanges: {},
        outcomeText: "Marcus found a loose rubber seal on tank three. He tightened it and saved our oxygen reserves!",
        crewReaction: {
          speaker: "Marcus Vance",
          role: "Systems & Power Engineer",
          text: "Found the loose valve! Air pressure is climbing right back to normal."
        },
        science: {
          text: "Spacecraft use automated pressure sensors to catch microscopic air leaks before humans notice.",
          sourceId: "nasa-mars-exploration-faq",
          typeTag: "Real NASA fact"
        }
      },
      {
        id: "backup_tank",
        label: "Switch to backup tank",
        plain: "Hook up an emergency air cylinder without checking for leaks.",
        deltas: { power: -2, lifeSupport: -3, radiationSafety: 0, morale: 0 },
        pendingEffects: [
          {
            triggerInSols: 2,
            deltas: { power: 0, lifeSupport: -5, radiationSafety: 0, morale: 0 },
            cause: "Unchecked Valve Leak",
            callbackText: "Remember switching tanks without fixing the leak? The backup tank leaked too! Life Support -5%."
          }
        ],
        modifiers: [],
        flags: ["switched_backup_tank"],
        objectiveChanges: {},
        outcomeText: "Fresh air rushed in from the backup tank, but the mystery leak was left unfixed.",
        crewReaction: {
          speaker: "Commander Rivera",
          role: "Outpost Commander",
          text: "Air is steady for now, but we are burning through our emergency bottles."
        },
        science: {
          text: "Oxygen is precious on Mars. Crews carry high-pressure emergency bottles for lifeboat safety.",
          sourceId: "nasa-mars-exploration-faq",
          typeTag: "Real NASA fact"
        }
      },
      {
        id: "slow_down",
        label: "Everyone moves less",
        plain: "Have everyone lie down and rest to use less oxygen.",
        deltas: { power: 0, lifeSupport: -4, radiationSafety: 0, morale: -4 },
        pendingEffects: [],
        modifiers: [],
        flags: ["slowed_down"],
        objectiveChanges: {},
        outcomeText: "The crew stayed in their bunks. Oxygen use slowed, but chores went unfinished.",
        crewReaction: {
          speaker: "Dr. Tariq Al-Mansoor",
          role: "Mission Scientist",
          text: "Resting saved a little air, but being stuck in bed all day was gloomy."
        },
        science: {
          text: "A resting human breathes about one third less oxygen than when working or exercising.",
          sourceId: "nasa-mars-exploration-faq",
          typeTag: "Science idea"
        }
      }
    ]
  },

  // 5. The Cold Room Mystery (Eligible: Sols 3, 11, 15)
  "evt_temp_drop": {
    id: "evt_temp_drop",
    title: "The Cold Room Mystery",
    type: "random",
    eligibleSlots: [3, 11, 15],
    chapter: 2,
    dangerLevel: "low",
    radiationAffecting: false,
    intro: "Thermometers in the science module say it dropped to near freezing. Frost formed on metal cabinets.",
    crewAdvice: {
      speaker: "Marcus Vance",
      role: "Systems & Power Engineer",
      text: "Did a heater burn out, or is the cold Martian night creeping in?"
    },
    choices: [
      {
        id: "cross_check",
        label: "Check the sensors first",
        plain: "Walk into the room with a handheld thermometer to verify.",
        deltas: { power: -1, lifeSupport: 0, radiationSafety: 0, morale: 0 },
        pendingEffects: [],
        modifiers: [],
        flags: ["temp_cross_checked"],
        objectiveChanges: {},
        outcomeText: "The room was warm! Only one wall sensor had a loose wire. Marcus fixed it in five minutes.",
        crewReaction: {
          speaker: "Marcus Vance",
          role: "Systems & Power Engineer",
          text: "False alarm! Just a loose sensor wire. Saved us from blasting the heaters."
        },
        science: {
          text: "Astronauts always cross-check sensor numbers with manual tools before taking big actions.",
          sourceId: "nasa-mars-exploration-faq",
          typeTag: "Real NASA fact"
        }
      },
      {
        id: "boost_heat",
        label: "Turn heaters way up",
        plain: "Pump maximum electric heat into the science room.",
        deltas: { power: -6, lifeSupport: 2, radiationSafety: 0, morale: 2 },
        pendingEffects: [],
        modifiers: [],
        flags: ["heaters_boosted"],
        objectiveChanges: {},
        outcomeText: "The room became warm quickly. But the heaters used lots of power.",
        crewReaction: {
          speaker: "Dr. Tariq Al-Mansoor",
          role: "Mission Scientist",
          text: "It feels like summer in here! But watch the battery meter drop."
        },
        science: {
          text: "Mars gets as cold as -100 degrees Celsius at night. Electric heaters need heavy power.",
          sourceId: "nasa-mars-exploration-faq",
          typeTag: "Real NASA fact"
        }
      },
      {
        id: "ignore",
        label: "Ignore the cold room",
        plain: "Close the door to the cold room and deal with it later.",
        deltas: { power: 0, lifeSupport: -2, radiationSafety: 0, morale: -2 },
        pendingEffects: [
          {
            triggerInSols: 3,
            deltas: { power: 0, lifeSupport: -6, radiationSafety: 0, morale: 0 },
            cause: "Frozen Water Pipe Burst",
            callbackText: "Remember ignoring the cold room? A water pipe froze and cracked! Life Support -6%."
          }
        ],
        modifiers: [],
        flags: ["temp_ignored"],
        objectiveChanges: {},
        outcomeText: "You shut the door. The room stayed near freezing while the crew tried not to think about it.",
        crewReaction: {
          speaker: "Commander Rivera",
          role: "Outpost Commander",
          text: "Leaving problems behind closed doors usually brings trouble later."
        },
        science: {
          text: "Water expands when it freezes into ice, creating enough force to split steel pipes.",
          sourceId: "nasa-mars-exploration-faq",
          typeTag: "Science idea"
        }
      }
    ]
  },

  // 6. Rover Battery Freezes (Eligible: Sols 6, 11, 19)
  "evt_frozen_battery": {
    id: "evt_frozen_battery",
    title: "Rover Battery Freezes",
    type: "random",
    eligibleSlots: [6, 11, 19],
    chapter: 2,
    dangerLevel: "medium",
    radiationAffecting: false,
    intro: "Our rover is parked in the freezing cold. Its main battery is getting too cold.",
    crewAdvice: {
      speaker: "Marcus Vance",
      role: "Systems & Power Engineer",
      text: "Cold batteries can stop working if they stay frozen too long."
    },
    choices: [
      {
        id: "heat_shed",
        label: "Park in the heated shed",
        plain: "Drive the rover inside our insulated shed and run its heaters.",
        deltas: { power: -4, lifeSupport: 0, radiationSafety: 0, morale: 0 },
        pendingEffects: [],
        modifiers: [],
        flags: ["rover_in_shed"],
        objectiveChanges: {},
        outcomeText: "The rover is safe in the warm shed. Its batteries stayed warm and healthy.",
        crewReaction: {
          speaker: "Marcus Vance",
          role: "Systems & Power Engineer",
          text: "Rover battery is back at 15 degrees Celsius. Ready for our next mission."
        },
        science: {
          text: "NASA rovers carry small nuclear or electric warmers to stop batteries from freezing overnight.",
          sourceId: "perseverance-dust-hazards",
          typeTag: "Real NASA fact"
        }
      },
      {
        id: "shut_down",
        label: "Turn off its instruments",
        plain: "Turn off all non-vital rover systems to save battery heat.",
        deltas: { power: -1, lifeSupport: 0, radiationSafety: 0, morale: -1 },
        pendingEffects: [],
        modifiers: [],
        flags: ["rover_instruments_off"],
        objectiveChanges: {},
        outcomeText: "The rover went to sleep in cold survival mode. It survived, but could not collect data.",
        crewReaction: {
          speaker: "Dr. Tariq Al-Mansoor",
          role: "Mission Scientist",
          text: "Science cameras were off all night, but the rover itself survived."
        },
        science: {
          text: "Deep sleep mode on space probes turns off computers to let survival heaters run.",
          sourceId: "nasa-mars-exploration-faq",
          typeTag: "Real NASA fact"
        }
      },
      {
        id: "push_on",
        label: "Drive through the night",
        plain: "Keep driving through the night so motor heat keeps batteries warm.",
        deltas: { power: -3, lifeSupport: -4, radiationSafety: 0, morale: 0 },
        pendingEffects: [
          {
            triggerInSols: 2,
            deltas: { power: -6, lifeSupport: 0, radiationSafety: 0, morale: 0 },
            cause: "Damaged Rover Battery Cells",
            callbackText: "Remember driving the frozen rover? Two battery cells broke from thermal stress! Power -6%."
          }
        ],
        modifiers: [],
        flags: ["rover_pushed_night"],
        objectiveChanges: {},
        outcomeText: "The rover drove through the dark. Motors stayed warm, but the frozen battery cells were strained.",
        crewReaction: {
          speaker: "Marcus Vance",
          role: "Systems & Power Engineer",
          text: "Those battery cells took a beating. I hope they hold a charge later."
        },
        science: {
          text: "Recharging or discharging lithium batteries while frozen can permanently damage their internal chemistry.",
          sourceId: "nasa-mars-exploration-faq",
          typeTag: "Science idea"
        }
      }
    ]
  },

  // 7. The Sun Blocks the Radio (Eligible: Sols 23, 27)
  "evt_radio_silence": {
    id: "evt_radio_silence",
    title: "The Sun Blocks the Radio",
    type: "random",
    eligibleSlots: [23, 27],
    chapter: 4,
    dangerLevel: "medium",
    radiationAffecting: false,
    intro: "Mars and Earth are lined up on opposite sides of the Sun. Hot solar gas blocks all radio waves.",
    crewAdvice: {
      speaker: "Commander Rivera",
      role: "Outpost Commander",
      text: "Even Earth's big dishes cannot push signals through the Sun right now."
    },
    choices: [
      {
        id: "preloaded",
        label: "Follow saved instructions",
        plain: "Stick strictly to Houston's pre-written solar conjunction guide.",
        deltas: { power: -3, lifeSupport: 0, radiationSafety: 0, morale: -1 },
        pendingEffects: [],
        modifiers: [],
        flags: ["followed_preloaded"],
        objectiveChanges: {},
        outcomeText: "The crew used the saved handbook. Everything ran safely without help.",
        crewReaction: {
          speaker: "Commander Rivera",
          role: "Outpost Commander",
          text: "Checklists saved the day. We don't need real-time talk for routine chores."
        },
        science: {
          text: "During solar conjunction, NASA stops sending commands to Mars for two weeks to avoid corrupted signals.",
          sourceId: "nasa-mars-comm-delay",
          typeTag: "Real NASA fact"
        }
      },
      {
        id: "research",
        label: "Do science while waiting",
        plain: "Use the quiet time to run lab tests on Martian dirt samples.",
        deltas: { power: -2, lifeSupport: 0, radiationSafety: 0, morale: 3 },
        pendingEffects: [],
        modifiers: [],
        flags: ["science_while_waiting"],
        objectiveChanges: {},
        outcomeText: "Tariq and Hoshi found curious salts in the lab. The team felt happy and busy!",
        crewReaction: {
          speaker: "Dr. Tariq Al-Mansoor",
          role: "Mission Scientist",
          text: "No radio interruptions meant three uninterrupted hours of microscope research!"
        },
        science: {
          text: "Mars rovers run autonomous research programs on their own while Earth cannot communicate.",
          sourceId: "nasa-mars-comm-delay",
          typeTag: "Real NASA fact"
        }
      },
      {
        id: "shed_load",
        label: "Turn off extra equipment",
        plain: "Power down communication receivers to save battery reserves.",
        deltas: { power: 2, lifeSupport: -4, radiationSafety: 0, morale: -3 },
        pendingEffects: [],
        modifiers: [],
        flags: ["radio_shed_load"],
        objectiveChanges: {},
        outcomeText: "Radios went silent. We saved power, but the dome felt very quiet and lonely.",
        crewReaction: {
          speaker: "Dr. Hoshi Reed",
          role: "Medical Officer",
          text: "The silence was heavy. Even static on the radio is comforting when you're on Mars."
        },
        science: {
          text: "Radio noise from the Sun causes static that can easily overpower human radio signals.",
          sourceId: "nasa-mars-comm-delay",
          typeTag: "Science idea"
        }
      }
    ]
  },

  // 8. Old Instructions From Earth (Eligible: Sols 19, 23, 27)
  "evt_ghost_msg": {
    id: "evt_ghost_msg",
    title: "Old Instructions From Earth",
    type: "random",
    eligibleSlots: [19, 23, 27],
    chapter: 4,
    dangerLevel: "medium",
    radiationAffecting: false,
    intro: "A delayed message from Houston arrived. But its instructions clash with what our local sensors show today.",
    crewAdvice: {
      speaker: "Commander Rivera",
      role: "Outpost Commander",
      text: "Earth's plan was made days ago. We are the ones standing on Mars."
    },
    choices: [
      {
        id: "follow_old",
        label: "Follow Earth's old plan",
        plain: "Follow Houston's original instructions step-by-step.",
        deltas: { power: -6, lifeSupport: 0, radiationSafety: 0, morale: -1 },
        pendingEffects: [],
        modifiers: [],
        flags: ["followed_earth_old"],
        objectiveChanges: {},
        outcomeText: "We followed the old plan. It worked, but fixing the out-of-date steps wasted power.",
        crewReaction: {
          speaker: "Marcus Vance",
          role: "Systems & Power Engineer",
          text: "Houston's plan did not know our battery was low. That took extra effort."
        },
        science: {
          text: "Radio signals take between 4 and 22 minutes each way between Earth and Mars.",
          sourceId: "nasa-mars-comm-delay",
          typeTag: "Real NASA fact"
        }
      },
      {
        id: "trust_local",
        label: "Trust our own sensors",
        plain: "Adapt the plan using what we see right now on Mars.",
        deltas: { power: -2, lifeSupport: -2, radiationSafety: 0, morale: 2 },
        pendingEffects: [],
        modifiers: [],
        flags: ["trusted_local"],
        objectiveChanges: {},
        outcomeText: "Commander Rivera changed the plan to match reality. The crew felt proud!",
        crewReaction: {
          speaker: "Commander Rivera",
          role: "Outpost Commander",
          text: "Commanders on Mars must make decisions. We know our situation best."
        },
        science: {
          text: "Because of communication delay, astronauts on Mars must be trained to make their own choices.",
          sourceId: "nasa-mars-comm-delay",
          typeTag: "Real NASA fact"
        }
      },
      {
        id: "ask_again",
        label: "Compare both plans carefully",
        plain: "Take time to write down and compare both plans before acting.",
        deltas: { power: -1, lifeSupport: -2, radiationSafety: 0, morale: -2 },
        pendingEffects: [],
        modifiers: [],
        flags: ["compared_plans"],
        objectiveChanges: {},
        outcomeText: "Comparing the plans took time and water, but prevented silly mistakes.",
        crewReaction: {
          speaker: "Dr. Hoshi Reed",
          role: "Medical Officer",
          text: "Taking a deep breath and thinking prevented an avoidable mistake."
        },
        science: {
          text: "Astronaut flight controllers use trade studies to weigh conflicting options before acting.",
          sourceId: "nasa-mars-exploration-faq",
          typeTag: "Science idea"
        }
      }
    ]
  },

  // =========================================================================
  // FIXED CAMPAIGN CRISES & MILESTONES
  // =========================================================================

  // Sol 14: Solar Storm Warning (Fixed, High Danger, Radiation Affecting)
  "evt_solar_particle": {
    id: "evt_solar_particle",
    title: "Solar Storm Warning",
    type: "fixed",
    sol: 14,
    chapter: 3,
    dangerLevel: "high",
    radiationAffecting: true,
    intro: "Satellites spotted a solar storm! Harmful rays are heading right toward Mars.",
    crewAdvice: {
      speaker: "Dr. Tariq Al-Mansoor",
      role: "Mission Scientist",
      text: "This radiation will pierce our thin dome roof. We must protect our bodies."
    },
    choices: [
      {
        id: "shelter",
        label: "Go to the storm shelter",
        plain: "Pack the crew into the thick underground sandbag bunker for 24 hours.",
        deltas: { power: -4, lifeSupport: -3, radiationSafety: 10, morale: -3 },
        pendingEffects: [],
        modifiers: [],
        flags: ["shelter_used"],
        objectiveChanges: { shelterProtocolsMaintained: true },
        outcomeText: "The crew huddled inside the underground shelter. The heavy sandbags blocked the harmful rays!",
        crewReaction: {
          speaker: "Dr. Hoshi Reed",
          role: "Medical Officer",
          text: "Dosimeter readings stayed in the safe green zone. Cramped, but we are completely safe!"
        },
        science: {
          text: "Mars has no magnetic field. Solar storms send dangerous radiation all the way to the ground.",
          sourceId: "curiosity-radiation-data",
          typeTag: "Real NASA fact"
        }
      },
      {
        id: "scrubbers",
        label: "Turn on the particle shield",
        plain: "Boost magnetic coils and air filters to protect the main living module.",
        deltas: { power: -10, lifeSupport: 2, radiationSafety: 3, morale: 0 },
        pendingEffects: [],
        modifiers: [],
        flags: ["particle_shield_boosted"],
        objectiveChanges: {},
        outcomeText: "Shields deflected some rays, but the big coils used heavy power.",
        crewReaction: {
          speaker: "Marcus Vance",
          role: "Systems & Power Engineer",
          text: "Electromagnets kept the living dome safe, but our battery reserve took a big hit."
        },
        science: {
          text: "NASA scientists are testing artificial magnetic shields to deflect radiation away from spacecraft.",
          sourceId: "curiosity-radiation-data",
          typeTag: "Science idea"
        }
      },
      {
        id: "stay_work",
        label: "Keep working in the lab",
        plain: "Stay in the science lab to record the storm through open glass windows.",
        deltas: { power: 4, lifeSupport: 0, radiationSafety: -25, morale: 2 },
        pendingEffects: [],
        modifiers: [],
        flags: ["stayed_in_lab"],
        objectiveChanges: {},
        outcomeText: "The cameras recorded pretty lights, but radiation alarms buzzed loudly!",
        crewReaction: {
          speaker: "Dr. Tariq Al-Mansoor",
          role: "Mission Scientist",
          text: "The northern sky danced in red and green, but our personal radiation meters buzzed red!"
        },
        science: {
          text: "Solar energetic particles can damage human DNA and require thick rock or water to stop them.",
          sourceId: "curiosity-radiation-data",
          typeTag: "Real NASA fact"
        }
      }
    ]
  },

  // Sol 21: Turn the Dish Toward Earth (Fixed, High Danger)
  "evt_antenna_alignment": {
    id: "evt_antenna_alignment",
    title: "Turn the Dish Toward Earth",
    type: "fixed",
    sol: 21,
    chapter: 4,
    dangerLevel: "high",
    radiationAffecting: false,
    intro: "Marcus fixed the antenna gears! Today Earth moves across our radio path.",
    crewAdvice: {
      speaker: "Marcus Vance",
      role: "Systems & Power Engineer",
      text: "Turning that huge 3-meter dish takes precision. A wrong motor angle will miss Earth completely."
    },
    choices: [
      {
        id: "align_quick",
        label: "Align it quickly",
        plain: "Marcus aims the dish using fast motorized sweeps.",
        deltas: { power: -4, lifeSupport: 0, radiationSafety: 0, morale: 0 },
        align: true,
        conditionalEffects: [
          {
            if: { morale: { below: 30 } },
            deltas: { power: -8 },
            extraText: "Tired hands slipped and the dish had to be re-done. That cost extra power."
          }
        ],
        pendingEffects: [],
        modifiers: [],
        flags: ["antenna_quick_aligned"],
        objectiveChanges: { antennaAligned: true },
        outcomeText: "The motors hummed and locked onto Earth's coordinates! Our backup beacon ping came alive!",
        crewReaction: {
          speaker: "Marcus Vance",
          role: "Systems & Power Engineer",
          text: "Dish is aimed right down the pipe toward Earth! Carrier beacon is locked!"
        },
        science: {
          text: "Deep space antennas must point with super accuracy to reach Earth millions of miles away.",
          sourceId: "nasa-mars-comm-delay",
          typeTag: "Real NASA fact"
        }
      },
      {
        id: "align_team",
        label: "Align with the whole team",
        plain: "All four astronauts work together to guide and lock the heavy dish.",
        deltas: { power: -6, lifeSupport: 0, radiationSafety: 0, morale: 2 },
        align: true,
        pendingEffects: [],
        modifiers: [],
        flags: ["antenna_team_aligned"],
        objectiveChanges: { antennaAligned: true },
        outcomeText: "Working together, the crew aimed the dish with no mistakes. The radio is hummed!",
        crewReaction: {
          speaker: "Commander Rivera",
          role: "Outpost Commander",
          text: "Teamwork made the difference. That dish is rock-solid and aimed straight at Houston."
        },
        science: {
          text: "Complex spacewalk tasks are always verified by multiple crew members to prevent alignment mistakes.",
          sourceId: "nasa-mars-exploration-faq",
          typeTag: "Real NASA fact"
        }
      },
      {
        id: "defer",
        label: "Wait until later",
        plain: "Leave the dish locked in its stowed position for today.",
        deltas: { power: 0, lifeSupport: 0, radiationSafety: 0, morale: -2 },
        align: false,
        pendingEffects: [],
        modifiers: [],
        flags: ["antenna_deferred"],
        objectiveChanges: { antennaAligned: false },
        outcomeText: "The dish stayed locked away. Earth sailed past the best sky angle, and the radio stayed silent.",
        crewReaction: {
          speaker: "Commander Rivera",
          role: "Outpost Commander",
          text: "The alignment window closed. Without aiming the dish, Earth will never hear us."
        },
        science: {
          text: "Planetary orbital geometry creates narrow windows when direct high-speed radio transmission is possible.",
          sourceId: "nasa-mars-comm-delay",
          typeTag: "Science idea"
        }
      }
    ]
  },

  // Sol 22: Fix the Shield Wall (Fixed, Radiation Affecting)
  "evt_regolith_shielding": {
    id: "evt_regolith_shielding",
    title: "Fix the Shield Wall",
    type: "fixed",
    sol: 22,
    chapter: 4,
    dangerLevel: "medium",
    radiationAffecting: true,
    intro: "Yesterday's storm wind knocked down part of our dirt wall.",
    crewAdvice: {
      speaker: "Dr. Hoshi Reed",
      role: "Medical Officer",
      text: "Even simple dirt walls block cosmic rays when you are sleeping."
    },
    choices: [
      {
        id: "berm",
        label: "Build up the dirt wall",
        plain: "Marcus scoops heavy red Martian dirt and rebuilds the thick berm.",
        deltas: { power: -4, lifeSupport: 0, radiationSafety: 15, morale: -3 },
        pendingEffects: [],
        modifiers: [],
        flags: ["dirt_berm_rebuilt"],
        objectiveChanges: {},
        outcomeText: "Marcus shoveled heavy red soil into thick barriers. Our sleeping quarters are safe again!",
        crewReaction: {
          speaker: "Marcus Vance",
          role: "Systems & Power Engineer",
          text: "A meter of Mars dirt makes the best radiation blanket on the planet."
        },
        science: {
          text: "Martian soil, called regolith, is rich in minerals that absorb space radiation and cosmic rays.",
          sourceId: "curiosity-radiation-data",
          typeTag: "Real NASA fact"
        }
      },
      {
        id: "skip_berm",
        label: "Skip the dirt wall",
        plain: "Save energy and leave the broken wall as it is.",
        deltas: { power: 0, lifeSupport: 0, radiationSafety: 0, morale: 1 },
        pendingEffects: [],
        modifiers: [],
        flags: ["skipped_berm"],
        objectiveChanges: {},
        outcomeText: "The crew rested instead. The wall stayed broken, but nobody was exhausted today.",
        crewReaction: {
          speaker: "Dr. Tariq Al-Mansoor",
          role: "Mission Scientist",
          text: "A restful afternoon, but cosmic rays will pass right through that gap."
        },
        science: {
          text: "Radiation damage builds up slowly over time, which is why astronaut shelters need constant upkeep.",
          sourceId: "curiosity-radiation-data",
          typeTag: "Science idea"
        }
      },
      {
        id: "water_wall",
        label: "Stack water containers as a wall",
        plain: "Line the bedroom wall with heavy recycled water tanks.",
        deltas: { power: -2, lifeSupport: -4, radiationSafety: 8, morale: 0 },
        pendingEffects: [],
        modifiers: [],
        flags: ["water_wall_stacked"],
        objectiveChanges: {},
        outcomeText: "Stacking water tanks made a good wall without any digging.",
        crewReaction: {
          speaker: "Dr. Hoshi Reed",
          role: "Medical Officer",
          text: "Water contains hydrogen atoms, which are fantastic at stopping fast cosmic protons!"
        },
        science: {
          text: "Water is one of the best radiation shields known because light hydrogen atoms absorb particle impacts.",
          sourceId: "curiosity-radiation-data",
          typeTag: "Real NASA fact"
        }
      }
    ]
  },

  // Sol 30: The Last Signal (Fixed Climax - Two real choices!)
  "evt_final_transmission": {
    id: "evt_final_transmission",
    title: "The Last Signal",
    type: "fixed",
    sol: 30,
    chapter: 5,
    dangerLevel: "high",
    radiationAffecting: false,
    intro: "Sol 30 has arrived. Earth's giant radio dishes are listening for our call.",
    crewAdvice: {
      speaker: "Commander Rivera",
      role: "Outpost Commander",
      text: "Earth will only send a rescue ship if it hears our signal before sunset."
    },
    choices: [
      {
        id: "choice_transmit_full",
        label: "Send the full message",
        plain: "Beam all our scientific data, photos, and mission logs to Earth.",
        shortMessage: false,
        deltas: { power: -8, lifeSupport: 0, radiationSafety: 0, morale: 0 },
        pendingEffects: [],
        modifiers: [],
        flags: ["full_transmission_sent"],
        objectiveChanges: {},
        outcomeText: "The 3.2-meter high-gain transmitter fired at full power! Gigabytes of science data beamed across the solar system!",
        crewReaction: {
          speaker: "Commander Rivera",
          role: "Outpost Commander",
          text: "Houston just confirmed lock! They have all our scientific discoveries and logs!"
        },
        science: {
          text: "NASA's Deep Space Network uses giant dishes to catch faint radio signals from across space.",
          sourceId: "nasa-mars-comm-delay",
          typeTag: "Real NASA fact"
        }
      },
      {
        id: "choice_transmit_short",
        label: "Send a short message",
        plain: "Send a brief emergency signal to save power, leaving out science files.",
        shortMessage: true,
        deltas: { power: -4, lifeSupport: 0, radiationSafety: 0, morale: 0 },
        pendingEffects: [],
        modifiers: [],
        flags: ["short_transmission_sent"],
        objectiveChanges: {},
        outcomeText: "A short, sharp emergency pulse beamed to Earth! Houston heard we are alive, though science files were skipped.",
        crewReaction: {
          speaker: "Marcus Vance",
          role: "Systems & Power Engineer",
          text: "Carrier wave verified! Houston knows we made it, even if the research data had to stay behind."
        },
        science: {
          text: "Short carrier signals need less electrical power to detect than large packets of image and sensor files.",
          sourceId: "nasa-mars-comm-delay",
          typeTag: "Science idea"
        }
      }
    ]
  },

  // =========================================================================
  // CREW BREAK MINI-EVENT (Rescue triggered when Morale < 15, cooldown 6 sols)
  // =========================================================================
  "evt_crew_break": {
    id: "evt_crew_break",
    title: "A Moment to Breathe",
    type: "break",
    chapter: 0,
    dangerLevel: "low",
    radiationAffecting: false,
    intro: "The crew is completely exhausted. If we push harder, someone will make a big mistake.",
    crewAdvice: {
      speaker: "Dr. Hoshi Reed",
      role: "Medical Officer",
      text: "Even tough astronauts need a short rest to feel happy again."
    },
    choices: [
      {
        id: "choice_movie_night",
        label: "Watch a movie together",
        plain: "Turn on the projector, pop some snacks, and laugh together.",
        deltas: { power: -3, lifeSupport: 0, radiationSafety: 0, morale: 20 },
        pendingEffects: [],
        modifiers: [],
        flags: ["movie_night_held"],
        objectiveChanges: {},
        outcomeText: "The crew laughed, ate warm snacks, and watched a funny movie. Spirits soared across the base!",
        crewReaction: {
          speaker: "Dr. Hoshi Reed",
          role: "Medical Officer",
          text: "Laughter was the best medicine. Everyone is smiling again."
        },
        science: {
          text: "NASA schedules regular movie nights and family phone calls to keep astronaut morale high on long spaceflights.",
          sourceId: "nasa-mars-exploration-faq",
          typeTag: "Real NASA fact"
        }
      },
      {
        id: "choice_team_talk",
        label: "Have a quiet team talk",
        plain: "Sit around the table and let everyone share how they feel.",
        deltas: { power: -1, lifeSupport: 0, radiationSafety: 0, morale: 12 },
        pendingEffects: [],
        modifiers: [],
        flags: ["team_talk_held"],
        objectiveChanges: {},
        outcomeText: "Talking things out cleared the air. The crew feels united and ready for the next challenge.",
        crewReaction: {
          speaker: "Commander Rivera",
          role: "Outpost Commander",
          text: "Listening to each other rebuilt our trust. We are one team."
        },
        science: {
          text: "Astronaut crews train in psychological communication to solve disagreements before stress causes accidents.",
          sourceId: "nasa-mars-exploration-faq",
          typeTag: "Real NASA fact"
        }
      },
      {
        id: "choice_keep_working",
        label: "Keep working without a break",
        plain: "Order the crew to push through the exhaustion and keep working.",
        deltas: { power: -4, lifeSupport: 0, radiationSafety: 0, morale: -6 },
        pendingEffects: [],
        modifiers: [],
        flags: ["break_denied"],
        objectiveChanges: {},
        outcomeText: "The crew stumbled through their shifts. Tired eyes caused tool slips and power waste.",
        crewReaction: {
          speaker: "Marcus Vance",
          role: "Systems & Power Engineer",
          text: "My eyes are burning. I dropped a wrench and shorted out a battery terminal."
        },
        science: {
          text: "Sleep deprivation and chronic stress impair human decision making just like physical illnesses.",
          sourceId: "nasa-mars-exploration-faq",
          typeTag: "Science idea"
        }
      }
    ]
  }
};
