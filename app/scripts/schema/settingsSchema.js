const settingsSchema = {
    settingsBundleVersion: '4.0.0',
    settings: [
        {
            prop: 'header',
            name: 'Interaction'
        },
        {
            prop: 'setting',
            id: 'interaction.penAlwaysDraws',
            group: 'Interaction',
            name: 'Pen always draws',
            description: 'Switch to a drawing tool when a pen is detected.',
            type: 'boolean',
            default: true
        },
        {
            prop: 'setting',
            id: 'interaction.allowTouchDrawing',
            group: 'Interaction',
            name: 'Allow Touch Drawing',
            description: 'Use your finger to draw content on the screen. When disabled, you can only use your mouse and a pen to draw.',
            type: 'boolean',
            default: true
        },
        {
            prop: 'setting',
            id: 'interaction.rightClickButtonAction',
            group: 'Interaction',
            name: 'Secondary Button Action',
            description: 'Choose what happens when the secondary button (right-click on a mouse/secondary button on a pen) is pressed.',
            type: 'enum',
            options: [
                { name: 'Select', value: 'select', description: 'Draw a rectangular box to select content on the screen.' },
                { name: 'Lasso', value: 'lasso', description: 'Draw a lassoo to select content on the screen' },
                { name: 'Ephemeral Stroke', value: 'ephemeralStroke', description: 'Draw a red ephemeral stroke.' },
                { name: 'None', value: 'none', description: 'Do nothing.' }
            ],
            default: 'ephemeralStroke'
        },
        {
            prop: 'header',
            name: 'Collaboration'
        },
        {
            prop: 'setting',
            id: 'collaboration.collaborationEnabled',
            group: 'Collaboration',
            name: 'Enable Collaboration',
            description: 'Allow other users to join your whiteboard using a shared link.',
            type: 'boolean',
            default: true
        },
        {
            prop: 'setting',
            id: 'collaboration.server.defaultServerURL',
            group: 'Collaboration',
            name: 'Default Server URL',
            description: 'The default server URL to use when connecting or sharing a whiteboard.',
            type: 'string',
            default: 'https://stride-backendservice.herokuapp.com/collab/server'
        },
        {
            prop: 'setting',
            id: 'collaboration.server.serverAuthentication',
            group: 'Collaboration',
            name: 'Server Authentication',
            description: 'Specify an authentication method to connect to the server. Not required when using the default server',
            type: 'enum',
            options: [
                { name: 'None', value: 'none', description: 'No authentication.' },
                { name: 'Client ID', value: 'clientID', description: 'Use your Client ID to authenticate.' },
                { name: 'Token', value: 'token', description: 'Use a token to authenticate.' }
            ],
            default: 'none'
        },
        {
            prop: 'setting',
            id: 'collaboration.server.clientID',
            group: 'Collaboration',
            name: 'Client ID',
            description: 'Used only when collaboration.server.serverAuthentication is set to Client ID. The Client ID to use when authenticating with the server.',
            type: 'string',
            default: ''
        },
        {
            prop: 'setting',
            id: 'collaboration.socket.enableLegacyLPTransport',
            group: 'Collaboration',
            name: 'Enable Legacy Long Polling Transport',
            description: 'Enable the long polling transport. This is required for older versions of the server, however is not recomended. Only enable this if you are having issues with the WebSocket transport.',
            type: 'boolean',
            default: false
        },
        {
            prop: 'setting',
            id: 'collaboration.socket.forceBase64Encoding',
            group: 'Collaboration',
            name: 'Force Base64 Encoding',
            description: 'Force the use of Base64 encoding for the WebSocket transport. Enable this if your network has issues coping with the output from the Rabbit encryption module',
            type: 'boolean',
            default: false
        },
        {
            prop: 'setting',
            id: 'collaboration.socket.closeSocketOnUnload',
            group: 'Collaboration',
            name: 'Close Socket on Unload',
            description: 'Close the socket when the page is unloaded Disable this if you are having issues with final strokes not being sent befor closing.',
            type: 'boolean',
            default: true
        },
        {
            prop: 'header',
            name: 'Privacy'
        },
        {
            prop: 'setting',
            id: 'privacy.telemetrylevel',
            group: 'Privacy',
            name: 'Allow Telemetry',
            description: 'Allow the use of telemetry to improve Whiteboard. This may include anonymous usage data, and error reports that do not include user data.',
            type: 'enum',
            options: [
                { name: 'None', value: 0, description: 'Do not allow telemetry.' },
                { name: 'Error Reports only', value: 1, description: 'Allow error reporting only.' }
            ],
            default: 0
        },
        {
            prop: 'setting',
            id: 'privacy.allowCloudConnectivity',
            group: 'Privacy',
            name: 'Allow Cloud Connectivity',
            description: 'Allow the use of cloud connectivity. When this setting is off, Whiteboard will not attempt to connect to any loud service. This will soft-disable the following features: Collaboration, Temporary-Save-To-Cloud, and all forms Telemetry.',
            type: 'boolean',
            default: true
        },
        {
            prop: 'setting',
            id: 'privacy.allowLocalIDCaching',
            group: 'Privacy',
            name: 'Allow Local ID Caching',
            description: 'Allow the use of local ID caching using LocalStorage. When this setting is off, Whiteboard will not remember your ID for when you connect or host a shared whiteboard.',
            type: 'boolean',
            default: true
        },
        {
            prop: 'header',
            name: 'Langauge & Region'
        },
        {
            prop: 'setting',
            id: 'localisation.language',
            group: 'Langauge & Region',
            name: 'Language',
            description: 'Change the UI language that Whiteboard uses.',
            type: 'enum',
            options: [
                { name: 'Auto', value: 'auto', description: 'Automatically detect your language' },
                { name: 'English', value: 'en', description: 'English Australian' }
            ],
            default: 'auto'
        },
        {
            prop: 'header',
            name: 'Advanced'
        },
        {
            prop: 'setting',
            id: 'flags.forceSpeedSVGRendring',
            group: 'Advanced',
            name: 'Force Speed SVG Rendering',
            description: 'Controls the rendering mode Whiteboard should force the browser to use.',
            type: 'enum',
            options: [
                { name: 'Auto', value: 'auto', description: 'Automattically set the rendering mode.' },
                { name: 'Force OptimizeSpeed', value: 'optimizeSpeed', description: 'Force the browser to always optimise for speed.' },
                { name: 'Force GeometricPrecision', value: 'geometricPrecision', description: 'Force the browser to always optimise for geometric precision.' }
            ],
            default: 'auto'
        },
        {
            prop: 'setting',
            id: 'flags.InteractionModuleDebugMode',
            group: 'Advanced',
            name: 'InteractionModule Debug Verbosity',
            description: 'Configures the verbosity of debug events thrown by the InteractionModule',
            type: 'enum',
            options: [
                { name: 'Disabled', value: 'Disabled', description: 'Do not log anything.' },
                { name: 'LogEventsToConsole', value: 'LogEventsToConsole', description: 'Log to the browser console.' },
                { name: 'LogEventsToDisplay', value: 'LogEventsToDisplay', description: 'Log to the display. This option will be deprecated soon.' },
                { name: 'LogEventsToConsoleAndDisplay', value: 'LogEventsToConsoleAndDisplay', description: 'Log to the console and display. This option will be deprecated soon.' }
            ],
            default: 'Disabled'
        },
        {
            prop: 'setting',
            id: 'flags.CoalescedEventsEnabled',
            group: 'Advanced',
            name: 'Enable CoalescedEvents',
            description: 'Determines if the new CoalescedEvents property is used.',
            type: 'enum',
            options: [
                { name: 'Disabled', value: 'Disabled', description: 'Discard coalesced events.' },
                { name: 'Enabled only for the CDX', value: 'EnabledOnlyCDX', description: 'Process coalesced events only ont he CDX' },
                { name: 'Enabled Globally', value: 'Enabled', description: 'Always process coalesced events.' }
            ],
            default: 'EnabledOnlyCDX'
        },
        {
            prop: 'setting',
            id: 'flags.PointerEventHandler',
            group: 'Advanced',
            name: 'InteractionModule PointerEvents Handler',
            description: 'Determines whichhandler the InteractionModule will use.',
            type: 'enum',
            options: [
                { name: 'UseLegacyHandler', value: 'UseLegacyHandler', description: 'Use the legacy handler.' },
                { name: 'UseTransitionalHandler', value: 'UseTransitionalHandler', description: 'Use the new transitional handler.' }
            ],
            default: 'UseTransitionalHandler'
        },
    ]
}

export default settingsSchema;