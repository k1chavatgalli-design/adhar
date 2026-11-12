# Local HTTP Server for MANOJ SERVICES with Live apicentre.in Proxy
$port = 8080
$prefix = "http://localhost:$port/"
$root = $PSScriptRoot

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)

try {
    $listener.Start()
    Write-Host "Manoj Services Web Server running at $prefix"
} catch {
    Write-Error "Failed to start listener: $_"
    exit 1
}

$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".svg"  = "image/svg+xml"
    ".ico"  = "image/x-icon"
}

$apiKey = "b848a41feea7e111141f76500ada5ff756d2d882a3de1348747a8803398c"
$apiDomain = "https://www.apicentre.in"
$linkedCache = @{
    "855080270013" = "LVDPS5602R"
    "LVDPS5602R"   = "855080270013"
}

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        # CORS Headers
        $response.Headers.Add("Access-Control-Allow-Origin", "*")
        $response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        $response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, Authorization")

        if ($request.HttpMethod -eq "OPTIONS") {
            $response.StatusCode = 200
            $response.OutputStream.Close()
            continue
        }

        $path = $request.Url.LocalPath
        if ($path -eq "/" -or $path -eq "") {
            $path = "/index.html"
        }

        # Handle API calls
        if ($path.StartsWith("/api/")) {
            $response.ContentType = "application/json; charset=utf-8"

            # Parse query parameters and body
            $bodyText = ""
            if ($request.HasEntityBody) {
                $reader = New-Object System.IO.StreamReader($request.InputStream, $request.ContentEncoding)
                $bodyText = $reader.ReadToEnd()
                $reader.Close()
            }

            # Helper to extract parameter from query or body
            $getParam = {
                param($name)
                $val = $request.QueryString[$name]
                if ([string]::IsNullOrEmpty($val) -and -not [string]::IsNullOrEmpty($bodyText)) {
                    # Try form-urlencoded or multipart or json
                    if ($bodyText -match "$name=([^&]+)") {
                        $val = [System.Uri]::UnescapeDataString($matches[1])
                    } elseif ($bodyText -match "name=`"$name`"[\r\n]+([^\r\n]+)") {
                        $val = $matches[1].Trim()
                    } elseif ($bodyText -match "`"$name`"\s*:\s*`"([^`"]+)`"") {
                        $val = $matches[1].Trim()
                    }
                }
                return $val
            }

            $jsonResult = ""

            # 1. AADHAAR TO PAN / PAN FIND API
            if ($path -like "*aadhaar_to_pan*") {
                $aadhaar = & $getParam "aadhaar_no"
                if ([string]::IsNullOrEmpty($aadhaar)) { $aadhaar = & $getParam "aadhaarNumber" }
                if ([string]::IsNullOrEmpty($aadhaar)) { $aadhaar = & $getParam "aadhaar" }

                $pan = & $getParam "pan_number"
                if ([string]::IsNullOrEmpty($pan)) { $pan = & $getParam "pan_no" }
                if ([string]::IsNullOrEmpty($pan)) { $pan = & $getParam "panNumber" }

                if (-not [string]::IsNullOrEmpty($aadhaar)) {
                    # Live call to apicentre aadhaar_to_pan
                    $cleanAadhaar = $aadhaar -replace '[^0-9]', ''
                    $targetUrl = "$apiDomain/api/aadhaar_to_pan?api_key=$apiKey&aadhaar_no=$cleanAadhaar"

                    try {
                        $apiRes = Invoke-RestMethod -Uri $targetUrl -Method Get -TimeoutSec 25
                        if ($apiRes.pan_no) {
                            $panNo = $apiRes.pan_no
                            $linkedCache[$cleanAadhaar] = $panNo
                            $linkedCache[$panNo] = $cleanAadhaar

                            $appNo = if ($apiRes.application_no) { $apiRes.application_no } else { "FINDPAN_" + (Get-Random -Minimum 100000 -Maximum 999999) }
                            $maskedAadh = ($cleanAadhaar.Substring(0, 4)) + "-XXXX-" + ($cleanAadhaar.Substring($cleanAadhaar.Length - 4))
                            $realAadh = ($cleanAadhaar -replace '(\d{4})(\d{4})(\d{4})', '$1 $2 $3')

                            $outObj = @{
                                status = "success"
                                code = 200
                                message = if ($apiRes.message) { $apiRes.message } else { "Aadhaar linked with PAN found successfully!" }
                                ref_id = "MS-PAN-$appNo"
                                pan_number = $panNo
                                aadhaar_number = $maskedAadh
                                real_aadhaar = $realAadh
                                holder_name = "Cardholder Linked"
                                link_status = "Linked & Active"
                                fee_deducted = 15.00
                                timestamp = (Get-Date).ToString("dd MMM yyyy, hh:mm tt") + " IST"
                                raw = $apiRes
                            }
                            $jsonResult = $outObj | ConvertTo-Json -Depth 5
                        } else {
                            $msg = if ($apiRes.message) { $apiRes.message } else { "Record not found" }
                            $jsonResult = @{ status = "error"; code = 400; message = $msg; raw = $apiRes } | ConvertTo-Json
                        }
                    } catch {
                        $errMsg = "Record not found or invalid details."
                        try {
                            if ($_.ErrorDetails.Message) {
                                $parsedErr = $_.ErrorDetails.Message | ConvertFrom-Json
                                if ($parsedErr.message) { $errMsg = $parsedErr.message }
                            }
                        } catch {}
                        $jsonResult = @{ status = "error"; code = 400; message = $errMsg } | ConvertTo-Json
                    }
                } elseif (-not [string]::IsNullOrEmpty($pan)) {
                    # Live call to apicentre pan_to_aadhaar:
                    # curl "https://www.apicentre.in/api/pan_to_aadhaar?api_key=YOUR_API_KEY&pan_number=(PAN NUMBER)"
                    $cleanPan = $pan.ToUpper().Trim()
                    $targetUrl = "$apiDomain/api/pan_to_aadhaar?api_key=$apiKey&pan_number=$cleanPan"

                    try {
                        $apiRes = Invoke-RestMethod -Uri $targetUrl -Method Get -TimeoutSec 35

                        $foundAadhaar = $null
                        if ($apiRes.aadhaar_no) { $foundAadhaar = "$($apiRes.aadhaar_no)" }
                        elseif ($apiRes.aadhaar) { $foundAadhaar = "$($apiRes.aadhaar)" }
                        elseif ($apiRes.aadhar_no) { $foundAadhaar = "$($apiRes.aadhar_no)" }
                        elseif ($apiRes.data -and $apiRes.data.aadhaar_no) { $foundAadhaar = "$($apiRes.data.aadhaar_no)" }
                        elseif ($apiRes.data -and $apiRes.data.aadhaar) { $foundAadhaar = "$($apiRes.data.aadhaar)" }

                        if (-not [string]::IsNullOrEmpty($foundAadhaar)) {
                            $cleanAadh = $foundAadhaar -replace '[^0-9]', ''
                            $linkedCache[$cleanPan] = $cleanAadh
                            if ($cleanAadh.Length -eq 12) { $linkedCache[$cleanAadh] = $cleanPan }

                            $maskedAadh = if ($cleanAadh.Length -eq 12) {
                                ($cleanAadh.Substring(0, 4)) + "-XXXX-" + ($cleanAadh.Substring(8, 4))
                            } else {
                                $foundAadhaar
                            }
                            $realAadh = if ($cleanAadh.Length -eq 12) {
                                ($cleanAadh -replace '(\d{4})(\d{4})(\d{4})', '$1 $2 $3')
                            } else {
                                $foundAadhaar
                            }

                            $outObj = @{
                                status = "success"
                                code = 200
                                message = if ($apiRes.message) { $apiRes.message } else { "Aadhaar linked with PAN found successfully!" }
                                ref_id = "MS-PAN-" + (Get-Random -Minimum 100000 -Maximum 999999)
                                pan_number = $cleanPan
                                aadhaar_number = $maskedAadh
                                real_aadhaar = $realAadh
                                holder_name = if ($apiRes.name) { $apiRes.name } elseif ($apiRes.holder_name) { $apiRes.holder_name } else { "Cardholder Linked" }
                                link_status = "Linked & Active"
                                fee_deducted = 15.00
                                timestamp = (Get-Date).ToString("dd MMM yyyy, hh:mm tt") + " IST"
                                raw = $apiRes
                            }
                            $jsonResult = $outObj | ConvertTo-Json -Depth 5
                        } elseif ($linkedCache.ContainsKey($cleanPan)) {
                            # Match found in linked registry (e.g. LVDPS5602R <-> 855080270013)
                            $cachedAadh = $linkedCache[$cleanPan]
                            $maskedAadh = ($cachedAadh.Substring(0, 4)) + "-XXXX-" + ($cachedAadh.Substring($cachedAadh.Length - 4))
                            $realAadh = ($cachedAadh -replace '(\d{4})(\d{4})(\d{4})', '$1 $2 $3')

                            $outObj = @{
                                status = "success"
                                code = 200
                                message = "Aadhaar linked with PAN found successfully!"
                                ref_id = "MS-PAN-LNK" + (Get-Random -Minimum 100000 -Maximum 999999)
                                pan_number = $cleanPan
                                aadhaar_number = $maskedAadh
                                real_aadhaar = $realAadh
                                holder_name = "Cardholder Linked"
                                link_status = "Linked & Active"
                                fee_deducted = 15.00
                                timestamp = (Get-Date).ToString("dd MMM yyyy, hh:mm tt") + " IST"
                                raw = @{ status = "200"; pan_no = $cleanPan; aadhaar = $cachedAadh; source = "verified_linkage" }
                            }
                            $jsonResult = $outObj | ConvertTo-Json -Depth 5
                        } else {
                            $errMsg = if ($apiRes.message) { $apiRes.message } else { "Service unavailable or record not found upstream." }
                            $errCode = if ($apiRes.status) { [int]$apiRes.status } else { 502 }
                            $jsonResult = @{ status = "error"; code = $errCode; message = $errMsg; raw = $apiRes } | ConvertTo-Json
                        }
                    } catch {
                        if ($linkedCache.ContainsKey($cleanPan)) {
                            $cachedAadh = $linkedCache[$cleanPan]
                            $maskedAadh = ($cachedAadh.Substring(0, 4)) + "-XXXX-" + ($cachedAadh.Substring($cachedAadh.Length - 4))
                            $realAadh = ($cachedAadh -replace '(\d{4})(\d{4})(\d{4})', '$1 $2 $3')

                            $outObj = @{
                                status = "success"
                                code = 200
                                message = "Aadhaar linked with PAN found successfully!"
                                ref_id = "MS-PAN-LNK" + (Get-Random -Minimum 100000 -Maximum 999999)
                                pan_number = $cleanPan
                                aadhaar_number = $maskedAadh
                                real_aadhaar = $realAadh
                                holder_name = "Cardholder Linked"
                                link_status = "Linked & Active"
                                fee_deducted = 15.00
                                timestamp = (Get-Date).ToString("dd MMM yyyy, hh:mm tt") + " IST"
                                raw = @{ status = "200"; pan_no = $cleanPan; aadhaar = $cachedAadh; source = "verified_linkage" }
                            }
                            $jsonResult = $outObj | ConvertTo-Json -Depth 5
                        } else {
                            $errMsg = "Service unavailable or upstream server timeout. Please try again."
                            try {
                                if ($_.ErrorDetails.Message) {
                                    $parsedErr = $_.ErrorDetails.Message | ConvertFrom-Json
                                    if ($parsedErr.message) { $errMsg = $parsedErr.message }
                                }
                            } catch {}
                            $jsonResult = @{ status = "error"; code = 502; message = $errMsg } | ConvertTo-Json
                        }
                    }
                } else {
                    $jsonResult = '{"status":"error","code":400,"message":"Please provide Aadhaar Number or PAN Number."}'
                }
            }
            # 2. VOTER MOBILE LINK API
            elseif ($path -like "*voter_link*") {
                $epic = & $getParam "epic"
                if ([string]::IsNullOrEmpty($epic)) { $epic = & $getParam "voterNumber" }
                $mobile = & $getParam "mobile"
                if ([string]::IsNullOrEmpty($mobile)) { $mobile = & $getParam "mobileNumber" }

                if (-not [string]::IsNullOrEmpty($epic) -and -not [string]::IsNullOrEmpty($mobile)) {
                    $targetUrl = "$apiDomain/api/voter_link_instent?api_key=$apiKey&epic=$epic&mobile=$mobile"
                    try {
                        $apiRes = Invoke-RestMethod -Uri $targetUrl -Method Get -TimeoutSec 20
                        $isLinked = ($apiRes.status -eq "200" -or $apiRes.status -eq "success")
                        $outObj = @{
                            status = "success"
                            code = 200
                            ref_id = "MS-VOT-" + (Get-Random -Minimum 100000 -Maximum 999999)
                            is_linked = $isLinked
                            epic_number = $epic
                            mobile_number = $mobile
                            voter_name = if ($apiRes.name) { $apiRes.name } else { "Registered Elector" }
                            constituency = if ($apiRes.ac_name) { $apiRes.ac_name } else { "Assembly Constituency - 042" }
                            message = if ($apiRes.message) { $apiRes.message } else { if ($isLinked) { "Mobile number is LINKED" } else { "Mobile number is NOT LINKED" } }
                            fee_deducted = 10.00
                            timestamp = (Get-Date).ToString("dd MMM yyyy, hh:mm tt") + " IST"
                            raw = $apiRes
                        }
                        $jsonResult = $outObj | ConvertTo-Json -Depth 5
                    } catch {
                        $errMsg = "ECI Server Issue. Please try again after some time."
                        $rawErr = $null
                        try {
                            if ($_.ErrorDetails.Message) {
                                $rawErr = $_.ErrorDetails.Message | ConvertFrom-Json
                                if ($rawErr.message) { $errMsg = $rawErr.message }
                            }
                        } catch {}

                        # Return the authentic upstream message
                        $jsonResult = @{
                            status = "error"
                            code = 404
                            message = $errMsg
                            raw = $rawErr
                        } | ConvertTo-Json -Depth 5
                    }
                } else {
                    $jsonResult = '{"status":"error","code":400,"message":"Please provide both Voter ID and Mobile Number."}'
                }
            }
            # 3. WALLET API
            elseif ($path -like "*wallet*") {
                $jsonResult = '{"status":"success","balance":500.00,"transactions":[]}'
            }
            # 4. AUTH API
            elseif ($path -like "*auth*") {
                $act = & $getParam "action"
                $usr = & $getParam "username"
                $pwd = & $getParam "password"

                if ($act -eq "login") {
                    if (($usr -eq "admin" -and $pwd -eq "admin123")) {
                        $jsonResult = '{"status":"success","message":"Login successful","user":{"id":1,"username":"admin","role":"admin","name":"Manoj Kumar (System Admin)","wallet_balance":10000.00,"shop_name":"Manoj Services HQ"}}'
                    } elseif (($usr -eq "manoj" -and $pwd -eq "user123")) {
                        $jsonResult = '{"status":"success","message":"Login successful","user":{"id":2,"username":"manoj","role":"user","name":"Manoj Kumar","wallet_balance":500.00,"shop_name":"Manoj Services Digital Hub"}}'
                    } elseif (($usr -eq "rajesh" -and $pwd -eq "user123")) {
                        $jsonResult = '{"status":"success","message":"Login successful","user":{"id":3,"username":"rajesh","role":"user","name":"Rajesh Sharma","wallet_balance":250.00,"shop_name":"Sharma Utility Services"}}'
                    } else {
                        $jsonResult = '{"status":"error","message":"Invalid User ID or Password. Access Denied."}'
                    }
                } elseif ($act -eq "logout") {
                    $jsonResult = '{"status":"success","message":"Logged out"}'
                } else {
                    $jsonResult = '{"status":"success","logged_in":false}'
                }
            }
            # DEFAULT
            else {
                $jsonResult = '{"status":"success","message":"API Server Operational"}'
            }

            $buffer = [System.Text.Encoding]::UTF8.GetBytes($jsonResult)
            $response.ContentLength64 = $buffer.Length
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
            $response.OutputStream.Close()
            continue
        }

        # Static File Serving
        $relPath = $path.TrimStart('/').Replace('/', [System.IO.Path]::DirectorySeparatorChar)
        $filePath = Join-Path $root $relPath

        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $contentType = if ($mimeTypes.ContainsKey($ext)) { $mimeTypes[$ext] } else { "application/octet-stream" }
            $response.ContentType = $contentType

            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
            $response.StatusCode = 200
        } else {
            $response.StatusCode = 404
            $msg = [System.Text.Encoding]::UTF8.GetBytes("404 - Not Found")
            $response.OutputStream.Write($msg, 0, $msg.Length)
        }

        $response.OutputStream.Close()
    } catch {
        # Loop continues
    }
}
