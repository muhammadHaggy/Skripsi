Place self-signed certificate files here:
 - selfsigned.crt
 - selfsigned.key

Generate with (replace 203.0.113.10 with your server IP):
openssl req -x509 -nodes -newkey rsa:4096 -days 365 \
  -keyout nginx/certs/selfsigned.key \
  -out nginx/certs/selfsigned.crt \
  -subj "/CN=203.0.113.10" \
  -addext "subjectAltName = IP:203.0.113.10"


