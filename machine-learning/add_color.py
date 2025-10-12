# Initialize parser
import argparse

parser = argparse.ArgumentParser()
 
# Adding optional argument
parser.add_argument("-n", "--name", help = "Project name")
parser.add_argument("-r", "--root", help = "Project name")
 
# Read arguments from command line
args = parser.parse_args()

with open(f'{args.root}', 'r+') as f:
    lines = f.readlines()
    f.seek(0)
    for line in lines:
        parts = line.strip().split()
        modified_line = ' '.join(parts) + ' 0.000000 0.000000 0.000000\n'
        f.write(modified_line)
    f.truncate()
f.close()
