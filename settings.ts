export default {
  commands: ['next', 'previous', 'repeat'],
  speeds: ['-10', '0', '10'],
  volumes: ['-4', '0', '4'],
  pitches: ['-10', '0', '10'],
  effects: [
    'breathing',
    'soft',
    'whispered',
    'conversational',
    'news',
    'customersupport',
    'assistant',
    'happy',
    'empathic',
  ],
  chunkSize: 16,
  rootDirPath: __dirname,
  outputDirName: 'output',
  sampleRate: '44100',
  voicemakerUrl: 'https://developer.voicemaker.in/voice/api'
}
