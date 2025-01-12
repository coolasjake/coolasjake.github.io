list = []
six_letters = []
new_data = ""

with open(r"files/new_6_letters.txt", 'r') as words_file:
    data = words_file.read()
    words = data.split("\n")

# with open(r"files/6_letter_plurals.txt", 'r') as plurals_file:
#     data = plurals_file.read()
#     plurals = data.split("\n")

print(len(words))
# print(len(plurals))

for word in words:
    if (len(word) > 0 and word[-1] == 's'):
        new_data += word + "\n"
        print(word)

    # if len(word) == 6:
    #     new_data += word + "\n"
    #     print(word)
    #     # if (word in plurals):
    #     #     print(word)
    #     # else:
    #     #      six_letters.append(word)
    #     #      new_data += word + "\n"


with open(r"files/new_6_letter_plurals.txt", 'w') as words_file:
    words_file.write(new_data)