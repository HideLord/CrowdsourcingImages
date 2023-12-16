"""
Temp storage for OTPs
"""

otps = {} # otp -> email

archive_pks_in_use = set()
archive_pages = {} # pk -> set(urls)