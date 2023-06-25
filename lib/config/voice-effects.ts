export default [
  {
    effects: ['breathing', 'soft', 'whispered'],
    voiceIds: [
      {
        language: 'all',
        voiceIds: [
          'ai1-Amy',
          'ai1-Emma',
          'ai1-Brian',
          'ai1-Joanna',
          'ai1-Olivia',
          'ai1-Kendra',
          'ai1-Kimberly',
          'ai1-Salli',
          'ai1-Joey',
          'ai1-Justin',
          'ai1-Kevin',
          'ai1-Matthew',
          'ai1-Ivy',
          'ai1-Amelia',
          'ai1-Mandisa',
        ],
      },
    ],
  },
  {
    effects: ['conversational'],
    filter: [
      {
        language: 'en-US',
        voiceIds: ['ai1-Joanna', 'ai1-Matthew', 'ai3-Aria', 'ai3-Jenny'],
      },
    ],
  },
  {
    effects: ['news'],
    filter: [
      {
        language: 'en-GB',
        voiceIds: ['ai1-Amy'],
      },
      {
        language: 'en-US',
        voiceIds: ['ai3-Jony', 'ai3-Aria', 'ai3-Jenny'],
      },
    ],
  },
  {
    effects: ['customersupport', 'assistant'],
    filter: [
      {
        language: 'en-GB',
        voiceIds: ['ai3-Aria', 'ai3-Jenny'],
      },
    ],
  },
  {
    effects: ['happy'],
    filter: [
      {
        language: 'en-GB',
        voiceIds: ['ai3-Aria', 'ai3-Jenny'],
      },
    ],
  },
  {
    effects: ['empathic'],
    filter: [
      {
        language: 'en-US',
        voiceIds: ['ai3-Aria'],
      },
    ],
  },
]
