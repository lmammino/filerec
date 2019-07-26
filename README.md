# filerec

![Filerec logo](/logo/filerec.png)

Spin up a local http server to securely accept files from friends and colleagues on the same lan or wan.

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

# send the file through curl
openssl enc -e -aes-256-cbc -nosalt -iv "${IV_HEX}" -K "${KEY}" -in "${FILENAME}" | \
curl -XPOST \
  --data-binary @- \
  -H "Content-Type: application/octet-stream" \
  -H "X-Sealed-Key: ${SEALED_KEY}" \
  -H "X-Encryption-IV: ${IV_B64}" \
  -H "X-Filename: ${FILENAME}" \
  "${SERVER}/file"
```
