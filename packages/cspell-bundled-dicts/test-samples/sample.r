# Program to check
if the input number is prime or not
# take input from the user
num = as.integer(readline(prompt = "Enter a number: "))
flag = 0
# prime numbers are greater than 1
if (num > 1) {
  # check
  for factors
  flag = 1
  for (i in 2: (num - 1)) {
    if ((num % % i) == 0) {
      flag = 0
      break
    }
  }
}
if (num == 2) flag = 1
if (flag == 1) {
  print(paste(num, "is a prime number"))
} else {
  print(paste(num, "is not a prime number"))
}
