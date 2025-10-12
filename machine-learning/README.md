# Tutorial

## Installation
1. head to ta-sultan-ghaitsa/ptv3
2. Run this command to prepare the environment

```bash
conda env create -f environment.yml
pip install open3d
```

2. activate virtualenv

```bash
conda activate pointcept

```

3. install pointcept built in functions

```bash
cd libs/pointops
python setup.py install
```

## Data Preparation

1. Have your PLY data ready
2. Convert it to txt, head to ta-sultan-ghaitsa/ptv3/Pointcept and run

```bash
python ply_to_txt.py -n {PROJECT NAME} -r {PLY data root}
```

2. Sometimes there can be a libgl stuff error. to fix run

```bash
apt-get update
apt-get install libgl1-mesa-glx
```

3. Add color

```bash
python add_color.py -n {PROJECT NAME} -r {TXT Result File}
```

4. Before preprocessed data to PointTransformer input format, make sure your data is structured as follow:

```bash
-DATASET FOLDER
 |-Area Folder
	 |-room name
		 |-Annotations
			 |-data.txt
			|-data.txt
		|- room-name_alignmentAngle.txt
			
For example:
-Dataset 1
	|- hydrant-lantai5
		|- hydrant-lantai5
			|- Annotations
				|- hydrant-lantai5.txt
			|- hydrant-lantai5.txt
		|- hydrant-lantai5_alignmentAngle.txt
		
**AlignmentAngle.txt only contains the degree of the rooms for example (you can create it yoruself)
hydrant-lantai5 0
room_2 180
etc...
```

5. Now run preprocess s3dis dataset

```bash
python pointcept/datasets/preprocessing/s3dis/preprocess_s3dis.py --dataset_root {DATASET FOLDER ROOT} --output_root {OUTPUT ROOT}
```

6. Now you are ready to run Inference/Test

## Inference

1. To run inference, put your ROOM FOLDER inside data/s3dis and just run

```bash
sh scripts/pred.sh -g 2 -p python -d s3dis -n s3dis-semseg-pt-v3m1-0-rpe -w model_best -s {ROOM FOLDER}
```

2. Your result will be available on exp/s3dis-semseg-pt-v3m1-0-rpe/result as an .npy file
3. Afterwards, you would need the full room PLY from 3dgs result and the .npy file to rebuild it as PLY
4. Move the .npy file to npy/
5. Move the full 3dgs PLY file to 3dgs_full_ply/ and rename it so it matches the npy
6. Runt the ply builder script

```bash
python segment_ply_from_npy.py -n {ROOM FOLDER NAME}
```

7. All the segmented PLY result will be stored at segment_result_ply/
