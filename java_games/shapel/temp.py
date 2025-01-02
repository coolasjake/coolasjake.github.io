list = []
six_letters = []
new_data = ""

with open(r"files/all_game_words.txt", 'r') as file:
    data = file.read()
    list = data.split("\n")

for word in list:
    if len(word) == 6:
        if '$' in word or '^' in word or '+' in word or '!' in word:
            continue
        print(word)
        six_letters.append(word)
        new_data += word + "\n"


with open(r"files/6_letter_words.txt", 'w') as file:
    file.write(new_data)