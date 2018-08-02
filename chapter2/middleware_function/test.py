from Crypto.PublicKey import RSA
keyPriv = RSA.importKey(open("momo_pub.pem", "rb"))
public_key = keyPriv.exportKey('PEM')
print public_key