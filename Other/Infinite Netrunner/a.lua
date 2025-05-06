-- main.lua

-- Helper function for distance
    function distance(x1, y1, x2, y2)
        return math.sqrt((x2 - x1)^2 + (y2 - y1)^2)
    end
    
    -- Helper function to check if mouse is over a rect (SCREEN COORDINATES)
    function isMouseOverRect(mx, my, x, y, w, h)
        return mx >= x and mx <= x + w and my >= y and my <= y + h
    end
    
    -- Helper function to generate a somewhat unique fake IP
    function generateFakeIP()
        return string.format("%d.%d.%d.%d", math.random(1, 254), math.random(0, 255), math.random(0, 255), math.random(1, 254))
    end
    
    local serverNamePrefixes = {"Zeus", "Apollo", "Ares", "Hades", "Poseidon", "Cronus", "Omega", "Alpha", "Cyber", "Net", "Data", "Quantum", "Void", "Echo"}
    local serverNameSuffixes = {"Core", "Hub", "Node", "Prime", "Sec", "Bank", "Corp", "Matrix", "Sphere", "Link", "Relay", "Vault", "Nexus"}
    function generateServerName()
        return serverNamePrefixes[math.random(#serverNamePrefixes)] .. "-" .. serverNameSuffixes[math.random(#serverNameSuffixes)]
    end
    
    -- Global game state
    local servers = {}
    local nextServerId = 1
    local player = {
        credits = 0,
        hackSkill = 1 -- Higher skill might make minigames easier or give more attempts later
    }
    local selectedServer = nil
    
    -- Game State Manager
    local gameState = "browsing" -- "browsing", "hacking_minigame"
    local activeMinigame = nil -- { type, prompt, challenge, solution, serverTarget }
    local minigameInputText = ""
    
    -- Camera
    local camera = {
        x = 0, y = 0, -- World coordinates of the center of the screen
        zoom = 1, targetZoom = 1,
        minZoom = 0.15, maxZoom = 3.0,
        zoomSpeed = 0.1, -- Multiplier for smooth zoom interpolation speed
        isPanning = false,
        panStartX = 0, panStartY = 0, -- Mouse position when panning started
        panOrigCamX = 0, panOrigCamY = 0, -- Camera position when panning started
        mouseWorldX = 0, mouseWorldY = 0 -- Mouse position in world coordinates
    }
    
    local serverRadius = 30
    local uiPanel = { x = 10, y = love.graphics.getHeight() - 150, w = love.graphics.getWidth() - 20, h = 140 }
    local hackButton = { x = uiPanel.x + 10, y = uiPanel.y + 100, w = 100, h = 30, text = "Hack" }
    
    -- Minigame UI
    local minigamePanel = { x = 150, y = 150, w = 500, h = 300 }
    local minigameSubmitButton = { x = minigamePanel.x + minigamePanel.w/2 - 50, y = minigamePanel.y + minigamePanel.h - 50, w = 100, h = 30, text = "Submit" }
    
    
    -- Function to convert screen coordinates to world coordinates
    function screenToWorld(screenX, screenY)
        local worldX = (screenX - love.graphics.getWidth() / 2) / camera.zoom + camera.x
        local worldY = (screenY - love.graphics.getHeight() / 2) / camera.zoom + camera.y
        return worldX, worldY
    end
    
    -- Function to create a new server
    function createServer(x, y, parentServer)
        local serverX, serverY
        if x and y then
            serverX, serverY = x,y
        else -- Default placement if no coords (e.g. initial server)
            serverX = camera.x + math.random(-love.graphics.getWidth()/(4*camera.zoom), love.graphics.getWidth()/(4*camera.zoom))
            serverY = camera.y + math.random(-love.graphics.getHeight()/(4*camera.zoom), love.graphics.getHeight()/(4*camera.zoom))
        end
    
        local newServer = {
            id = nextServerId,
            name = generateServerName(),
            ip = generateFakeIP(),
            x = serverX, y = serverY,
            radius = serverRadius,
            security = math.random(1, 5) + (parentServer and parentServer.depth or 0) + math.floor((parentServer and parentServer.depth or 0)/3), -- Security scales with depth
            resourcesPerTick = math.random(1, 5) + math.floor((parentServer and parentServer.depth or 0)/2),
            isHacked = false,
            isRevealed = parentServer == nil,
            connections = {},
            depth = (parentServer and parentServer.depth or 0) + 1,
            miningProgress = 0,
            miningCycleTime = 2 -- seconds per resource tick
        }
        nextServerId = nextServerId + 1
        table.insert(servers, newServer)
    
        if parentServer then
            table.insert(parentServer.connections, newServer.id)
            table.insert(newServer.connections, parentServer.id)
        end
        return newServer
    end
    
    function findServerById(id)
        for _, server in ipairs(servers) do
            if server.id == id then return server end
        end
        return nil
    end
    
    -- Minigame Helper: Binary to Text
    function binaryToText(binaryStr)
        local text = ""
        binaryStr = binaryStr:gsub("%s+", "") -- Remove spaces
        if #binaryStr % 8 ~= 0 then return nil, "Invalid binary length (must be multiple of 8)." end
        for i = 1, #binaryStr, 8 do
            local byte = binaryStr:sub(i, i + 7)
            if not byte:match("^[01]+$") then return nil, "Invalid characters in binary string (only 0 or 1 allowed)." end
            local charCode = tonumber(byte, 2)
            if not charCode then return nil, "Error converting binary segment to number." end
            text = text .. string.char(charCode)
        end
        return text
    end
    
    -- Minigame Helper: Caesar Cipher
    function caesarCipher(text, shift, encrypt)
        local result = ""
        shift = shift % 26
        for i = 1, #text do
            local c = text:sub(i, i)
            local code = string.byte(c)
            if c:match("%u") then -- Uppercase
                local base = string.byte('A')
                if encrypt then code = (code - base + shift) % 26 + base
                else code = (code - base - shift + 26) % 26 + base end
                result = result .. string.char(code)
            elseif c:match("%l") then -- Lowercase
                local base = string.byte('a')
                if encrypt then code = (code - base + shift) % 26 + base
                else code = (code - base - shift + 26) % 26 + base end
                result = result .. string.char(code)
            else result = result .. c end -- Non-alphabetic characters unchanged
        end
        return result
    end
    
    function startMinigame(serverToHack)
        selectedServer = serverToHack -- Ensure it's selected
        minigameInputText = "" -- Reset input
        local minigameTypeRand = math.random(1,2)
    
        if minigameTypeRand == 1 then -- Binary to Text
            local words = {"KERNEL", "ACCESS", "SHELL", "ADMIN", "CYPHER", "SECURE", "DATA"}
            local solution = words[math.random(#words)]
            local challengeBinary = ""
            for i = 1, #solution do
                local byteVal = string.byte(solution:sub(i,i))
                local binByte = ""
                for j = 7, 0, -1 do binByte = binByte .. (math.floor(byteVal / (2^j)) % 2) end
                challengeBinary = challengeBinary .. binByte .. " "
            end
            activeMinigame = {
                type = "Binary Decryption",
                prompt = "Translate the binary code to plaintext:",
                challenge = string.sub(challengeBinary,1, #challengeBinary-1), -- remove trailing space
                solution = solution,
                serverTarget = serverToHack
            }
        else -- Caesar Cipher
            local words = {"FIREWALL", "PROTOCOL", "NETWORK", "PASSWORD", "ENCRYPT", "SERVER"}
            local solution = words[math.random(#words)]
            local shift = math.random(3, 10) -- Make shift non-trivial
            local challengeCipher = caesarCipher(solution, shift, true) -- Encrypt
            activeMinigame = {
                type = "Caesar Cipher Decryption",
                prompt = "Decrypt the ciphertext. It's a Caesar cipher!\n(Hint: Common English letter frequencies might help, or try small shifts.)",
                challenge = challengeCipher,
                solution = solution,
                shift = shift, -- Store for potential hints or easier mode later
                serverTarget = serverToHack
            }
        end
        gameState = "hacking_minigame"
        love.keyboard.setTextInput(true) -- Enable text input events
    end
    
    function completeHack(hackedServer)
        hackedServer.isHacked = true
        player.credits = player.credits + hackedServer.security * 20 -- Increased reward for minigame
    
        -- Reveal connected servers
        for _, connectedId in ipairs(hackedServer.connections) do
            local connectedNode = findServerById(connectedId)
            if connectedNode and not connectedNode.isRevealed then
                connectedNode.isRevealed = true
            end
        end
    
        -- Spawn new connections (chance-based)
        local spawnedNewRandomly = false
        -- Try to spawn more if network is small, or based on depth
        local maxConnections = 3 + math.floor(hackedServer.depth / 5)
        if #hackedServer.connections < maxConnections and math.random() > 0.2 then
            local numNewConnections = math.random(0, 2)
            if hackedServer.depth < 2 then numNewConnections = math.random(1,2) end -- Encourage early spread
    
            for i = 1, numNewConnections do
                local angle = math.random() * 2 * math.pi
                local dist = math.random(120, 280) -- Absolute distance in world units
                local newX = hackedServer.x + math.cos(angle) * dist
                local newY = hackedServer.y + math.sin(angle) * dist
                
                local tooClose = false
                for _, s_check in ipairs(servers) do
                    if s_check.id ~= hackedServer.id and distance(newX, newY, s_check.x, s_check.y) < serverRadius * 3 then
                        tooClose = true; break
                    end
                end
                if not tooClose then
                    createServer(newX, newY, hackedServer).isRevealed = true -- Make newly spawned from hack revealed
                    spawnedNewRandomly = true
                end
            end
        end
    
        -- GUARANTEED SPAWN LOGIC
        local unhackedRevealedCount = 0
        for _, s in ipairs(servers) do
            if s.isRevealed and not s.isHacked and s.id ~= hackedServer.id then -- Exclude the server just hacked
                unhackedRevealedCount = unhackedRevealedCount + 1
            end
        end
        
        -- If no other hackable targets are visible AND we didn't just spawn one randomly
        if unhackedRevealedCount == 0 and not spawnedNewRandomly then
            print("GUARANTEED SPAWN triggered from: " .. hackedServer.name)
            local success = false
            local attempts = 0
            while not success and attempts < 15 do
                local angle = math.random() * 2 * math.pi
                local dist = math.random(150, 350)
                local newX = hackedServer.x + math.cos(angle) * dist
                local newY = hackedServer.y + math.sin(angle) * dist
                local tooClose = false
                for _, s_check in ipairs(servers) do
                     if distance(newX, newY, s_check.x, s_check.y) < serverRadius * 3 then
                        tooClose = true; break
                    end
                end
                if not tooClose then
                    createServer(newX, newY, hackedServer).isRevealed = true
                    success = true
                    print("Guaranteed server spawned.")
                end
                attempts = attempts + 1
            end
            if not success then print("Failed to place guaranteed server for " .. hackedServer.name .. " after " .. attempts .. " attempts.") end
        end
    
        gameState = "browsing"
        activeMinigame = nil
        love.keyboard.setTextInput(false)
        selectedServer = hackedServer -- Keep it selected
    end
    
    function failHack(serverTarget, reason)
        print("Hack FAILED on " .. serverTarget.name .. ". Reason: " .. (reason or "Incorrect solution."))
        -- Penalty: e.g., temporary lockout, small credit loss, or security increase
        player.credits = math.max(0, player.credits - serverTarget.security * 2)
        -- serverTarget.security = serverTarget.security + 1 -- Make it harder next time
        
        gameState = "browsing"
        activeMinigame = nil
        love.keyboard.setTextInput(false)
        selectedServer = serverTarget
    end
    
    function love.load()
        love.window.setTitle("NetRunner Infinite: Minigames & Camera")
        love.graphics.setBackgroundColor(0.1, 0.1, 0.15)
        math.randomseed(os.time())
        love.keyboard.setKeyRepeat(true) -- For text input
    
        -- Initial camera position to center the first server
        camera.x = love.graphics.getWidth() / 2
        camera.y = (love.graphics.getHeight() - uiPanel.h) / 2
    
        local rootServer = createServer(camera.x, camera.y)
        rootServer.isRevealed = true
        rootServer.security = 1 -- Easy first server
    
        for i = 1, math.random(1, 2) do
            local angle = math.random() * 2 * math.pi
            local dist = math.random(100, 150)
            local newX = rootServer.x + math.cos(angle) * dist
            local newY = rootServer.y + math.sin(angle) * dist
            createServer(newX, newY, rootServer).isRevealed = true -- Reveal initial branches
        end
    end
    
    function love.update(dt)
        -- Smooth zoom
        if math.abs(camera.zoom - camera.targetZoom) > 0.001 then
            camera.zoom = camera.zoom + (camera.targetZoom - camera.zoom) * camera.zoomSpeed * 20 * dt -- Faster interpolation
        else
            camera.zoom = camera.targetZoom
        end
        camera.zoom = math.max(camera.minZoom, math.min(camera.maxZoom, camera.zoom))
    
    
        if gameState == "browsing" then
            -- Update mining from hacked servers
            for _, server in ipairs(servers) do
                if server.isHacked and server.isRevealed then
                    server.miningProgress = server.miningProgress + dt
                    if server.miningProgress >= server.miningCycleTime then
                        player.credits = player.credits + server.resourcesPerTick
                        server.miningProgress = server.miningProgress - server.miningCycleTime
                    end
                end
            end
        elseif gameState == "hacking_minigame" then
            -- No timed logic for minigames yet, input driven
        end
    
        -- Update mouse world coordinates (used for zoom-to-cursor)
        local mx, my = love.mouse.getPosition()
        camera.mouseWorldX, camera.mouseWorldY = screenToWorld(mx,my)
    end
    
    function love.draw()
        -- UI Elements (Screen Space - Top)
        -- These are drawn first and are not affected by camera.
        love.graphics.setColor(1, 1, 1)
        love.graphics.print("Credits: " .. math.floor(player.credits), 10, 10)
        love.graphics.print("Hack Skill: " .. string.format("%.1f", player.hackSkill), 10, 30)
        love.graphics.print(string.format("Cam X: %.0f Y: %.0f Zoom: %.2fx", camera.x, camera.y, camera.zoom), 10, 50)
        -- For debugging mouse world position if needed:
        -- love.graphics.print(string.format("Mouse World X: %.0f Y: %.0f", camera.mouseWorldX, camera.mouseWorldY), 10, 70)
    
        -- Apply camera transformations for world objects
        love.graphics.push()
        love.graphics.translate(love.graphics.getWidth() / 2, love.graphics.getHeight() / 2)
        love.graphics.scale(camera.zoom, camera.zoom)
        love.graphics.translate(-camera.x, -camera.y)
    
        -- Draw connections (World Space)
        love.graphics.setLineWidth(math.max(1, 2 / camera.zoom)) -- Line width scales inversely with zoom
        for _, server in ipairs(servers) do
            if server.isRevealed then
                for _, connectedId in ipairs(server.connections) do
                    local connectedNode = findServerById(connectedId)
                    if connectedNode and connectedNode.isRevealed then
                        if server.isHacked and connectedNode.isHacked then
                            love.graphics.setColor(0.1, 0.7, 0.15) -- Darker green for hacked connections
                        else
                            love.graphics.setColor(0.4, 0.4, 0.45) -- Grey line
                        end
                        love.graphics.line(server.x, server.y, connectedNode.x, connectedNode.y)
                    end
                end
            end
        end
        love.graphics.setLineWidth(1) -- Reset default line width for other drawings if any (though circles don't use it)
    
        -- Draw servers (World Space)
        for _, server in ipairs(servers) do
            if server.isRevealed then
                -- Determine server color
                if server == selectedServer then
                    love.graphics.setColor(0.6, 0.6, 1) -- Blueish tint for selected
                elseif server.isHacked then
                    love.graphics.setColor(0.2, 0.8, 0.2) -- Green for hacked
                elseif activeMinigame and activeMinigame.serverTarget and activeMinigame.serverTarget.id == server.id then
                    love.graphics.setColor(1, 0.5, 0) -- Orange while minigame is active for this server
                else
                    love.graphics.setColor(0.8, 0.8, 0.8) -- Default revealed color
                end
                love.graphics.circle("fill", server.x, server.y, server.radius)
    
                -- Server border
                love.graphics.setColor(0.1, 0.1, 0.1) -- Dark border
                love.graphics.circle("line", server.x, server.y, server.radius, math.max(4, 24 / camera.zoom)) -- Thicker border, scales
    
                -- Server name
                love.graphics.setColor(0, 0, 0) -- Black text for name
                local oldFont = love.graphics.getFont()
                local fontSize = math.floor(math.max(8, 12 / camera.zoom)) -- Scale font size based on zoom
                
                -- Only create a new font object if the size actually changes to avoid performance hit
                -- This requires a bit more state management or a font cache for true optimization,
                -- but for simplicity, we'll compare heights.
                if not oldFont or fontSize ~= oldFont:getHeight() then
                    local tempFont = love.graphics.newFont(fontSize)
                    if tempFont then love.graphics.setFont(tempFont)
                    -- else: keep old font if new one fails to create (shouldn't happen with default font)
                    end
                end
                
                love.graphics.printf(server.name, server.x - server.radius * 0.9, server.y - fontSize * 0.6, server.radius * 1.8, "center")
                
                if oldFont then love.graphics.setFont(oldFont) end -- Revert to original default font
            end
        end
        love.graphics.pop() -- Revert camera transformations
    
        -- UI Elements (Screen Space - Bottom Panel and Minigame Overlay)
        -- Main UI Panel
        love.graphics.setColor(0.2, 0.2, 0.25, 0.9)
        love.graphics.rectangle("fill", uiPanel.x, uiPanel.y, uiPanel.w, uiPanel.h)
        love.graphics.setColor(1, 1, 1) -- White border for UI panel
        love.graphics.rectangle("line", uiPanel.x, uiPanel.y, uiPanel.w, uiPanel.h)
    
        if gameState == "browsing" then
            if selectedServer then
                love.graphics.setColor(1, 1, 1) -- White text for panel info
                love.graphics.printf("Selected: " .. selectedServer.name .. " (IP: " .. selectedServer.ip .. ")", uiPanel.x + 10, uiPanel.y + 10, uiPanel.w - 20, "left")
                love.graphics.printf("Security Level: " .. selectedServer.security, uiPanel.x + 10, uiPanel.y + 30, uiPanel.w - 20, "left")
                love.graphics.printf("Est. Resources/cycle: " .. selectedServer.resourcesPerTick, uiPanel.x + 10, uiPanel.y + 50, uiPanel.w - 20, "left")
                local status = selectedServer.isHacked and "HACKED (Mining)" or "SECURE"
                love.graphics.printf("Status: " .. status, uiPanel.x + 10, uiPanel.y + 70, uiPanel.w - 20, "left")
    
                if not selectedServer.isHacked then
                    -- Hack Button
                    local bx, by, bw, bh = hackButton.x, hackButton.y, hackButton.w, hackButton.h
                    love.graphics.setColor(0.7, 0.7, 0.7) -- Button color
                    love.graphics.rectangle("fill", bx, by, bw, bh)
                    love.graphics.setColor(0, 0, 0) -- Button text color
                    love.graphics.printf(hackButton.text, bx, by + bh / 2 - 7, bw, "center")
                end
            else
                love.graphics.setColor(0.7, 0.7, 0.7) -- Dimmed text
                love.graphics.printf("Select a server node. Scroll to zoom. Middle-mouse or Space+LMB to pan.", uiPanel.x + 10, uiPanel.y + 10, uiPanel.w - 20, "left")
            end
        end
    
        -- Minigame UI Panel (Drawn on top of everything else if active)
        if gameState == "hacking_minigame" and activeMinigame then
            -- Panel Background
            love.graphics.setColor(0.15, 0.15, 0.2, 0.98) -- More opaque
            love.graphics.rectangle("fill", minigamePanel.x, minigamePanel.y, minigamePanel.w, minigamePanel.h)
            love.graphics.setColor(1, 1, 1) -- White border
            love.graphics.rectangle("line", minigamePanel.x, minigamePanel.y, minigamePanel.w, minigamePanel.h)
    
            -- Title
            love.graphics.setColor(1, 1, 1) -- White text
            love.graphics.printf(activeMinigame.type .. " on " .. activeMinigame.serverTarget.name, minigamePanel.x + 10, minigamePanel.y + 10, minigamePanel.w - 20, "center")
            
            -- Prompt
            love.graphics.printf(activeMinigame.prompt, minigamePanel.x + 10, minigamePanel.y + 40, minigamePanel.w - 20, "left")
            
            -- Display challenge text with wrapping (using Font:getWrap)
            local challengeFont = love.graphics.getFont() -- Use current default font
            local challengeTextY = minigamePanel.y + 80 -- Initial Y for challenge text block
            
            if not (activeMinigame and activeMinigame.challenge) then
                love.graphics.setColor(1, 0, 0) -- Red for error
                love.graphics.print("Error: Minigame challenge data is missing.", minigamePanel.x + 20, challengeTextY)
                print("DEBUG: activeMinigame or activeMinigame.challenge is nil in draw for challenge text.")
            elseif not challengeFont then
                love.graphics.setColor(1, 0, 0) -- Red for error
                love.graphics.print("Error: Font not available for challenge.", minigamePanel.x + 20, challengeTextY)
                print("DEBUG: challengeFont is nil in draw for minigame challenge text.")
            else
                local textForChallengeDisplay = tostring(activeMinigame.challenge)
                local wrapWidth = minigamePanel.w - 40
                
                if wrapWidth <= 0 then
                    print("Warning: Minigame panel wrap width is too small for Font:getWrap. Setting to 1.")
                    wrapWidth = 1
                end
    
                local lines = challengeFont:getWrap(textForChallengeDisplay, wrapWidth)
                
                love.graphics.setColor(1, 1, 1) -- Reset to white for text
                if lines and type(lines) == "table" then
                    for _, lineText in ipairs(lines) do
                        love.graphics.print(lineText, minigamePanel.x + 20, challengeTextY)
                        challengeTextY = challengeTextY + challengeFont:getHeight()
                    end
                else
                    love.graphics.setColor(1, 0, 0)
                    local errorMsg = "Error: Font:getWrap failed for challenge text."
                    love.graphics.print(errorMsg, minigamePanel.x + 20, challengeTextY)
                    challengeTextY = challengeTextY + challengeFont:getHeight()
                    love.graphics.setColor(0.8, 0.8, 0.8)
                    love.graphics.printf("Original: " .. textForChallengeDisplay, minigamePanel.x + 20, challengeTextY, wrapWidth, "left")
                    print(errorMsg, "Text:", textForChallengeDisplay, "WrapWidth:", wrapWidth, "Result:", tostring(lines))
                end
            end
            
            -- Input Field and Label (Positioned after challenge text)
            local inputFieldBaseY = math.max(challengeTextY + 10, minigamePanel.y + minigamePanel.h - 100) -- Ensure space
            
            love.graphics.setColor(1,1,1)
            love.graphics.print("Your Answer:", minigamePanel.x + 10, inputFieldBaseY)
            love.graphics.setColor(0.9, 0.9, 0.9) -- Input field background
            love.graphics.rectangle("fill", minigamePanel.x + 10, inputFieldBaseY + 20, minigamePanel.w - 20, 30)
            love.graphics.setColor(0, 0, 0) -- Input text color
            love.graphics.print(minigameInputText .. (math.fmod(love.timer.getTime(), 1) < 0.5 and "_" or ""), minigamePanel.x + 15, inputFieldBaseY + 25) -- Text with blinking cursor
    
            -- Submit button
            local sbx, sby, sbw, sbh = minigameSubmitButton.x, minigameSubmitButton.y, minigameSubmitButton.w, minigameSubmitButton.h
            love.graphics.setColor(0.7, 0.7, 0.7) -- Button color
            love.graphics.rectangle("fill", sbx, sby, sbw, sbh)
            love.graphics.setColor(0, 0, 0) -- Button text color
            love.graphics.printf(minigameSubmitButton.text, sbx, sby + sbh / 2 - 7, sbw, "center")
        end
    end
    
    function love.mousepressed(x, y, button, istouch, presses)
        if gameState == "browsing" then
            local worldX, worldY = screenToWorld(x, y)
    
            if button == 1 then
                local clickedOnServer = false
                for i = #servers, 1, -1 do -- Iterate backwards for potential overlap (though not a true fix)
                    local server = servers[i]
                    if server.isRevealed and distance(worldX, worldY, server.x, server.y) < server.radius then
                        selectedServer = server
                        clickedOnServer = true
                        break
                    end
                end
    
                -- Hack button click (UI SPACE)
                if selectedServer and not selectedServer.isHacked then
                    if isMouseOverRect(x, y, hackButton.x, hackButton.y, hackButton.w, hackButton.h) then
                        startMinigame(selectedServer)
                        return -- Stop further processing this click
                    end
                end
    
                -- Start panning with LMB if Space is held OR if not clicking on UI/Server
                if love.keyboard.isDown("space") or 
                   (not clickedOnServer and not isMouseOverRect(x,y, uiPanel.x, uiPanel.y, uiPanel.w, uiPanel.h)) then
                    camera.isPanning = true
                    camera.panStartX, camera.panStartY = x, y
                    camera.panOrigCamX, camera.panOrigCamY = camera.x, camera.y
                end
    
            elseif button == 2 then -- Middle mouse button for panning
                camera.isPanning = true
                camera.panStartX, camera.panStartY = x, y
                camera.panOrigCamX, camera.panOrigCamY = camera.x, camera.y
            end
    
        elseif gameState == "hacking_minigame" then
            if button == 1 then
                if isMouseOverRect(x, y, minigameSubmitButton.x, minigameSubmitButton.y, minigameSubmitButton.w, minigameSubmitButton.h) then
                    processMinigameSubmission()
                end
            end
        end
    end
    
    function love.mousereleased(x, y, button, istouch, presses)
        if button == 1 or button == 2 then -- Release left or middle mouse
            camera.isPanning = false
        end
    end
    
    function love.mousemoved(x, y, dx, dy, istouch)
        if camera.isPanning then
            camera.x = camera.panOrigCamX - (x - camera.panStartX) / camera.zoom
            camera.y = camera.panOrigCamY - (y - camera.panStartY) / camera.zoom
        end
        -- Update mouse world coordinates continuously (already done in update, but can be here too for immediate use)
        -- camera.mouseWorldX, camera.mouseWorldY = screenToWorld(x,y)
    end
    
    function love.wheelmoved(dx, dy) -- dy is 1 for scroll up, -1 for scroll down
        local oldZoom = camera.zoom
        local mouseX, mouseY = love.mouse.getPosition() -- Screen coordinates of mouse
    
        if dy > 0 then camera.targetZoom = camera.targetZoom * 1.25
        elseif dy < 0 then camera.targetZoom = camera.targetZoom / 1.25 end
        camera.targetZoom = math.max(camera.minZoom, math.min(camera.maxZoom, camera.targetZoom))
    
        -- Zoom towards mouse: Adjust camera.x and camera.y
        -- The world point under the mouse should remain the same after zoom.
        -- camera.mouseWorldX/Y is the world point under the mouse *before* this zoom event.
        -- new_cam_x = world_mouse_x - (screen_mouse_x - screen_center_x) / new_zoom
        camera.x = camera.mouseWorldX - (mouseX - love.graphics.getWidth() / 2) / camera.targetZoom
        camera.y = camera.mouseWorldY - (mouseY - love.graphics.getHeight() / 2) / camera.targetZoom
    end
    
    function processMinigameSubmission()
        if not activeMinigame then return end
    
        local userAnswer = minigameInputText:upper():gsub("%s+", "") -- Normalize: uppercase, remove spaces
        local solution = activeMinigame.solution:upper():gsub("%s+", "")
    
        if activeMinigame.type == "Binary Decryption" then
            local decodedAttempt, err = binaryToText(minigameInputText) -- Pass raw input to binaryToText
            if err then
                failHack(activeMinigame.serverTarget, "Minigame Error: " .. err)
            elseif decodedAttempt and decodedAttempt:upper() == solution then
                completeHack(activeMinigame.serverTarget)
            else
                failHack(activeMinigame.serverTarget, "Incorrect binary translation.")
            end
        elseif activeMinigame.type == "Caesar Cipher Decryption" then
            -- For Caesar, direct comparison of user's text input
            if userAnswer == solution then
                completeHack(activeMinigame.serverTarget)
            else
                failHack(activeMinigame.serverTarget, "Incorrect Caesar decryption.")
            end
        end
    end
    
    function love.keypressed(key, scancode, isrepeat)
        if gameState == "browsing" then
            if key == "escape" then love.event.quit() end
            if key == "u" and player.credits >= 100 * player.hackSkill then -- Scaled upgrade cost
                player.credits = player.credits - (100 * player.hackSkill)
                player.hackSkill = player.hackSkill + 0.2
                print("Hack Skill Upgraded to: " .. player.hackSkill)
            end
        elseif gameState == "hacking_minigame" then
            if key == "escape" then
                failHack(activeMinigame.serverTarget, "Minigame aborted.")
            elseif key == "backspace" then
                minigameInputText = minigameInputText:sub(1, -2)
            elseif key == "return" or key == "kpenter" then
                processMinigameSubmission()
            end
        end
    end
    
    function love.textinput(t)
        if gameState == "hacking_minigame" and activeMinigame then
            minigameInputText = minigameInputText .. t
        end
    end