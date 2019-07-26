<p align="center">
  <img src="/logo/filerec.svg" alt="Filerec logo"/>
</p>

<p align="center"><strong>Local HTTP 1.1 server to securely receive files from friends and colleagues on the local network.</strong></p>

...


## Send a file with curl (encrypted)

```bash
FILENAME="/some/file" # change this
SERVER="http://localhost:12345" # change this

# get server public key
SERVER_KEY="/tmp/filrerec-key-$(date +%s).pem"
curl "${SERVER}/key" > "${SERVER_KEY}"

# generate random symmetric key and initialization vector
KEY=$(openssl rand -hex 32)
IV=$(openssl rand 16)
IV_B64=$(echo -ne "${IV}" | base64)
IV_HEX=$(echo -ne "${IV}" | xxd -ps)

# encrypt the key with server public key
SEALED_KEY=$(echo -ne "${KEY}" | openssl rsautl -encrypt -oaep -pubin -inkey ${SERVER_KEY} | base64)

# encrypt the file and send it with curl
openssl enc -e -aes-256-cbc -nosalt -iv "${IV_HEX}" -K "${KEY}" -in "${FILENAME}" | \
curl -XPOST \
  --data-binary @- \
  -H "Content-Type: application/octet-stream" \
  -H "X-Sealed-Key: ${SEALED_KEY}" \
  -H "X-Encryption-IV: ${IV_B64}" \
  -H "X-Filename: ${FILENAME}" \
  "${SERVER}/file"
```
