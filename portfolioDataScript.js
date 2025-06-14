const projectsData = [
    { 
        title: "Torn Trade Analyzer", 
        date: "2025", 
        description: "Trade analyser for Torn traders using Torn API", 
        skills: ["HTML", "CSS", "Bootstrap (Framework)", "JavaScript"], 
        categories: ["Websites"], 
        media: [ { type: "website", url: "https://psemo.github.io/Other/TornTradeAnalyzer/" }, { type: "youtube", url: "https://youtu.be/UIuwDKq19RI" } ]
    },
    { 
        title: "Actually idle idler: The Ultimate Idle", 
        date: "2025", 
        description: "A mockeray of the idle game genre", 
        skills: ["Love2D", "Lua"], 
        categories: ["Games"], 
        media: [ { type: "itch-io", url: "https://psemo.itch.io/actually-idle-idler-the-ultimate-idle" }, { type: "youtube", url: "https://youtu.be/mMqKP2eLCqs" } ]
    },
    { 
        title: "Infinite Netrunner v2.1", 
        date: "2025", 
        description: "A game where you hack by solving coding problems", 
        skills: ["HTML", "CSS", "JavaScript"], 
        categories: ["Games", "Websites"], 
        media: [ { type: "itch-io", url: "https://psemo.itch.io/coding-challanges" }, { type: "youtube", url: "https://youtu.be/DY14k0rOs-g" } ]
    },
    { 
        title: "Escape The Mothership", 
        date: "2025", 
        description: "3D bullet-hell game", 
        skills: ["Unity", "C#"], 
        categories: ["Games"], 
        media: [ { type: "itch-io", url: "https://gabrielrg.itch.io/escape-the-mothership" }, { type: "youtube", url: "https://youtu.be/Ss5aOxDOzlE" } ]
    },
    { 
        title: "Late Stage Capitalism: The Game", 
        date: "2025", 
        description: "A criticism", 
        skills: ["HTML", "CSS", "JavaScript"], 
        categories: ["Games", "Websites"], 
        media: [ { type: "itch-io", url: "https://psemo.itch.io/late-stage-capitalism-the-game" }, { type: "youtube", url: "https://youtu.be/gHYeZCR8_DE" } ]
    },
    { 
        title: "Designed/developed/self-hosted Website", 
        date: "Mar 2025 - May 2025", 
        description: "Designed/coded/self-hosted a secure website on a Linux server. It had a moden interface and many auto-created pages using ejs.", 
        skills: ["HTML", "CSS", "Bootstrap (Framework)", "JavaScript", "Node.js", "Express.js", "Embedded JavaScript (EJS)", "MongoDB", "Nginx", "Linux", "Ubuntu", "Network Security", "Server Administration", "Network Administration"], 
        categories: ["Websites"], 
        media: [ { type: "github", url: "https://github.com/PSEMO/FactionsAndBusinesses" }, { type: "youtube", url: "https://www.youtube.com/watch?v=-RiSxwd19iM" } ]
    },
    { 
        title: "Grind Mindset", 
        date: "Apr 2025 - May 2025", 
        description: "Designed and coded an executable game with web technologies that consists of a single file. Has 2-4 hours of content, sounds, animations and more.", 
        skills: ["HTML", "CSS", "JavaScript", "NW.js", "Node.js", "Electron"], 
        categories: ["Games", "Apps", "Websites"], 
        media: [ { type: "steam", url: "https://store.steampowered.com/app/3723800/Grind_Mindset/" }, { type: "youtube", url: "https://www.youtube.com/watch?v=MJFYJCW6wMM" } ]
    },
    { 
        title: "Downward Vacation", 
        date: "Mar 2025 - Mar 2025", 
        description: "A game made with Unity in 72 hours. It was made for a competition.", 
        skills: ["Unity", "C#"], 
        categories: ["Games"], 
        media: [ { type: "itch-io", url: "https://psemo.itch.io/downward-vacation" }, { type: "youtube", url: "https://www.youtube.com/watch?v=S4Bq6zmdbxE" } ]
    },
    { 
        title: "Website self-hosting (PUBLIC)", 
        date: "Nov 2024 - Jan 2025", 
        description: "Designed, coded and self-hosted a secure website on Linux infrastructure (Ubuntu Server edition) without a desktop environment. Sustained uptime despite heavy bot traffic and successfully managed its security while keeping the site publicly accessible.", 
        skills: ["HTML", "CSS", "JavaScript", "DDNS", "Apache", "Linux", "Ubuntu", "Network Security", "Server Administration", "Network Administration"], 
        categories: ["Websites"], 
        media: [ { type: "youtube", url: "https://www.youtube.com/watch?v=vldSshKI1jE" } ]
    },
    { 
        title: "Cast of The Click", 
        date: "Jul 2024 - Jul 2024", 
        description: "A game like \"Duck Hunt\"", 
        skills: ["Unity", "C#"], 
        categories: ["Games"], 
        media: [ { type: "itch-io", url: "https://taronic449.itch.io/cast-of-the-click" }, { type: "youtube", url: "https://www.youtube.com/watch?v=pmlxnOdohJ8" } ]
    },
    { 
        title: "Linktree like website for my portfolio and socials", 
        date: "Jul 2024 - Regularly up dated", 
        description: "A static website hosted by Github", 
        skills: ["HTML", "CSS", "JavaScript"], 
        categories: ["Websites"], 
        media: [ { type: "website", url: "https://psemo.github.io/", 
        title: "Live Website" }, { type: "github", url: "https://github.com/PSEMO/psemo.github.io" } ]
    },
    { 
        title: "Redmi12 MIUI Debloat", 
        date: "Jul 2024 - Jul 2024", 
        description: "This is an guide on how to debloat your Redmi 12 phone using Linux", 
        skills: ["Android", "Debian", "Linux"], 
        categories: ["Other"], 
        media: [ { type: "github", url: "https://github.com/PSEMO/Redmi12-MIUI-Debloat" } ]
    },
    { 
        title: "Debian and xfce setup", 
        date: "Jun 2024 - Jun 2024", 
        description: "An easy to follow guide and bash codes for having a fully functional and game ready Debian with Xfce4 desktop environment.", 
        skills: ["Debian", "Linux"], 
        categories: ["Other"], 
        media: [ { type: "github", url: "https://github.com/PSEMO/Debian-and-xfce-setup" }, { type: "youtube", url: "https://www.youtube.com/watch?v=PHvwRlX_-sA" } ]
    },
    { 
        title: "Who is the killer? (a LLM + AI game)", 
        date: "May 2024 - May 2024", 
        description: "This is an AI based crime solving game made using llama-2-chat uncensored Q4_0 edition, PyGame, OpenAI.", 
        skills: ["Python", "Pygame", "AI", "LLM"], 
        categories: ["Games"], 
        media: [ { type: "github", url: "https://github.com/PSEMO/Lm-studio-pygame-game" }, { type: "youtube", url: "https://www.youtube.com/watch?v=QmITHFdItQA" } ]
    },
    { 
        title: "Quickly On Duty", 
        date: "Mar 2024 - Mar 2024", 
        description: "We developed this game within 72 hours for mini-jam. This game came at 23th place out of 200 joined.", 
        skills: ["Unity", "C#", "Aseprite"], 
        categories: ["Games"], 
        media: [ { type: "youtube", url: "https://www.youtube.com/watch?v=zfsBJ2p2Bp0" } ]
    },
    { 
        title: "Dodge Machine", 
        date: "Jan 2024 - Jan 2024", 
        description: "There is a black ball in the middle that is able to successfully escape many incoming random balls even though it is bigger and slower.", 
        skills: ["Python", "Pygame", "Digital Audio Workstations"], 
        categories: ["Games", "Apps"], 
        media: [ { type: "youtube", url: "https://www.youtube.com/watch?v=qEWcDDcPD74" } ]
    },
    { 
        title: "Freedom Tourism", 
        date: "Oct 2023 - Jan 2024", 
        description: "This is a Bus Booking Management System with a SQL database, full login system, admin/driver panels, and a complete payment system.", 
        skills: ["WinForms", "SQL", "C#"], 
        categories: ["Apps"], 
        media: [ { type: "youtube", url: "https://www.youtube.com/watch?v=zBVXzsThIQg" } ]
    },
    { 
        title: "Hack();", 
        date: "Dec 2023 - Dec 2023", 
        description: "We developed this game within 72 hours for mini-jam. This game came at 4th place out of 274 joined.", 
        skills: ["Unity", "C#", "Aseprite"], 
        categories: ["Games"], 
        media: [ { type: "youtube", url: "https://www.youtube.com/watch?v=o8Ti1S8Q7hU" } ]
    },
    { 
        title: "It's Cold!", 
        date: "Dec 2023 - Dec 2023", 
        description: "I developed this game within 48 hours by myself using Pygame. This game came at 119th place out of 536 joined.", 
        skills: ["Python", "Pygame", "GIMP", "Aseprite"], 
        categories: ["Games"], 
        media: [ { type: "youtube", url: "https://www.youtube.com/watch?v=z9flygyCxZU" } ]
    },
    { 
        title: "Auto Cookie Clicker", 
        date: "Oct 2023 - Oct 2023", 
        description: "This is a semi-dynamic auto clicker app for the game Cookie Clicker.", 
        skills: ["Python", "PySimpleGUI", "PyAutoGUI"], 
        categories: ["Apps"], 
        media: [ { type: "youtube", url: "https://www.youtube.com/watch?v=V4p1iUGkqIA" } ]
    },
    { 
        title: "Galton Board breaker", 
        date: "Sep 2023 - Sep 2023", 
        description: "Runs until every ball fall into the same tube. Which is directly opposite to what Galton board is there to show, hence the name.", 
        skills: ["C#", ".NET Framework"], 
        categories: ["Apps"], 
        media: [ { type: "youtube", url: "https://www.youtube.com/watch?v=_C2PS2NgVT0" } ]
    },
    { 
        title: "HTML-Learning-Site", 
        date: "Sep 2023 - Sep 2023", 
        description: "a webpage that aims to teach HTML", 
        skills: ["HTML", "CSS"], 
        categories: ["Websites"], 
        media: [ { type: "github", url: "https://github.com/PSEMO/HTML-Learning-Site" } ]
    },
    { 
        title: "20 Number game & auto player & winrate", 
        date: "Aug 2023 - Aug 2023", 
        description: "I created a web game for 20 number game and an auto player for it in .NET then I determined its win rate using these.", 
        skills: ["HTML", "CSS", "JavaScript", ".NET Framework", "C#"], 
        categories: ["Games", "Websites", "Apps"], 
        media: [ { type: "youtube", url: "https://www.youtube.com/watch?v=3WjCm1GrHKw" } ]
    },
    { 
        title: "Sheep Dreams", 
        date: "Jul 2023 - Jul 2023", 
        description: "I developed this game within a week. This game came at First place in popularity out of 64 joined.", 
        skills: ["Unity", "C#", "GIMP", "Aseprite"], 
        categories: ["Games"], 
        media: [ { type: "youtube", url: "https://www.youtube.com/watch?v=joLZKo8727g" } ]
    },
    { 
        title: "Chrome's Dino game (multi-engine)", 
        date: "Jun 2023 - Jun 2023", 
        description: "I made the same simple game using different methods/engines: Unity, Love2D, Solar2D, MonoGame, HTML/JS and Minecraft.", 
        skills: ["Unity", "HTML/CSS/JS", "Love2D", "Corona SDK", "MonoGame", "Minecraft"], 
        categories: ["Games", "Websites"], 
        media: [ { type: "youtube", url: "https://www.youtube.com/watch?v=DCdu47MpSFA" }, { type: "github", url: "https://github.com/PSEMO/Dino-Game-with-Unity" } ]
    },
    { 
        title: "Panzerkampfwagen!", 
        date: "Feb 2023 - Mar 2023", 
        description: "I developed this game within a month by myself with Love2D. This game came at 3rd place out of 21 joined.", 
        skills: ["Love2D", "Lua", "Hardon Collider", "Box2D", "Aseprite"], 
        categories: ["Games"], 
        media: [ { type: "youtube", url: "https://www.youtube.com/watch?v=HzlbWZ5cWjY" } ]
    },
    { 
        title: "Space drone", 
        date: "Feb 2023 - Feb 2023", 
        description: "I developed this game within 6 days. This game came at 2nd place on overall enjoyment out of 69 joined.", 
        skills: ["Unity", "C#", "Aseprite", "Digital Audio Workstations"], 
        categories: ["Games"], 
        media: [ { type: "youtube", url: "https://www.youtube.com/watch?v=qwLz6tIEdb4" } ]
    },
    { 
        title: "Conquer!", 
        date: "Nov 2022 - Nov 2022", 
        description: "I developed this game within a week by myself using Solar2D. This game came at 2nd place out of 13 joined.", 
        skills: ["Solar2D", "Box2D", "Corona SDK"], 
        categories: ["Games"], 
        media: [ { type: "youtube", url: "https://www.youtube.com/watch?v=ap326i2iJqU" } ]
    },
    { 
        title: "A Shooting Star", 
        date: "Oct 2022 - Oct 2022", 
        description: "I developed this game within 72 hours by myself. This game came at 54th place out of 379 joined.", 
        skills: ["Unity", "C#", "Aseprite", "GIMP", "LootLocker"], 
        categories: ["Games"], 
        media: [ { type: "youtube", url: "https://www.youtube.com/watch?v=JGIhzp6Npxc" } ]
    },
    { 
        title: "Endless Hook & Swing", 
        date: "Sep 2022 - Oct 2022", 
        description: "A Play Store game. It is one of the most polished game I have developed and published.", 
        skills: ["Unity", "C#", "GIMP"], 
        categories: ["Games"], 
        media: [ { type: "youtube", url: "https://www.youtube.com/watch?v=yaxwmY7t49c" } ]
    },
    { 
        title: "Shotgun: Ghost Warrior", 
        date: "Oct 2022 - Oct 2022", 
        description: "I developed this game within 72 hours for a mini-jam with a team. I was the lead developer. This game came at 72nd place out of 726 joined.", 
        skills: ["Unity", "C#"], 
        categories: ["Games"], 
        media: [ { type: "youtube", url: "https://www.youtube.com/watch?v=1GWeUrOW3ZA" } ]
    },
    { 
        title: "Make-bigger-text-in-text-format", 
        date: "Oct 2021 - Oct 2021", 
        description: "A console app which translates user input into bigger text that are made with ASCII characters.", 
        skills: [".NET Framework", "C#"], 
        categories: ["Apps"], 
        media: [ { type: "github", url: "https://github.com/PSEMO/Make-bigger-text-in-text-format" } ]
    },
    { 
        title: "Emoji Translator:Discord Emoji", 
        date: "May 2021 - May 2021", 
        description: "A Play Store application that transforms standard text input into bigger texts using emojis.", 
        skills: ["Android Studio", "Java", "GIMP"], 
        categories: ["Apps"], 
        media: [ { type: "youtube", url: "https://www.youtube.com/watch?v=PJSrqYUDoIU" } ]
    },
    { 
        title: "Infinite Platformer", 
        date: "Dec 2020 - Apr 2021", 
        description: "A Play Store game. This game has features such as endless procedural generation, admob ads, and in-app purchases.", 
        skills: ["GIMP", "Unity", "Google Ads", "C#"], 
        categories: ["Games"], 
        media: [ { type: "youtube", url: "https://www.youtube.com/watch?v=xI5ZJ9uaNoU" } ]
    },
    { 
        title: "Magical Swords: First", 
        date: "Jun 2020 - Nov 2020", 
        description: "A Play Store game. My first game ^^", 
        skills: ["Unity", "C#", "GIMP"], 
        categories: ["Games"], 
        media: [ { type: "youtube", url: "https://www.youtube.com/watch?v=JJ-X7QkkUt8" } ]
    },
];