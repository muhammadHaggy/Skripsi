_base_ = ["../_base_/default_runtime.py"]

batch_size = 2
num_worker = 4
mix_prob = 0.0
empty_cache = False
enable_amp = True

model = dict(
    type="DefaultSegmentorV2",
    num_classes=2,
    backbone_out_channels=64,
    backbone=dict(
        type="PT-v3m1",
        in_channels=3,
        order=("z", "z-trans", "hilbert", "hilbert-trans"),
        stride=(2, 2, 2, 2),
        enc_depths=(2, 2, 2, 6, 2),
        enc_channels=(32, 64, 128, 256, 512),
        enc_num_head=(2, 4, 8, 16, 32),
        enc_patch_size=(512, 512, 512, 512, 512),
        dec_depths=(2, 2, 2, 2),
        dec_channels=(64, 64, 128, 256),
        dec_num_head=(4, 4, 8, 16),
        dec_patch_size=(512, 512, 512, 512),
        mlp_ratio=4,
        qkv_bias=True,
        drop_path=0.3,
        shuffle_orders=True,
        enable_rpe=False,
        enable_flash=False,
        cls_mode=False,
    ),
    criteria=[
        dict(type="CrossEntropyLoss", loss_weight=1.0, ignore_index=-1),
        dict(type="LovaszLoss", mode="multiclass", loss_weight=1.0, ignore_index=-1),
    ],
)
epoch=300
scheduler = dict(
    type="OneCycleLR",
    max_lr=[0.001],
    div_factor=10.0,
    final_div_factor=1000.0,
)

optimizer = dict(
    type="AdamW",
    lr=0.001,
    weight_decay=0.05
)

dataset_type = "DefaultDataset"
data_root = "data/custom_box"

data = dict(
    num_classes=2,
    ignore_index=-1,
    names=["floor", "box"],
    train=dict(
        type=dataset_type,
        split= "area1",
        data_root=data_root,
        transform=[
            dict(type="CenterShift", apply_z=True),
            dict(type="RandomRotate", angle=[-1, 1], axis="z", center=[0, 0, 0], p=0.5),
            dict(type="RandomScale", scale=[0.9, 1.1]),
            dict(type="RandomFlip", p=0.5),
            dict(type="GridSample", grid_size=0.03, hash_type="fnv", mode="train", return_grid_coord=True),
            dict(type="SphereCrop", point_max=10240, mode="random"),

            dict(type="CenterShift", apply_z=False),
            dict(type="ToTensor"),
            dict(type="Collect", keys=("coord", "grid_coord", "segment"), feat_keys=["coord"]),
        ],
        test_mode=False,
    ),
    val=dict(
        type=dataset_type,
        split="split",
        data_root=data_root,
        transform=[
            dict(type="CenterShift", apply_z=True),
            dict(type="Copy", keys_dict={"coord": "origin_coord", "segment": "origin_segment"}),
            dict(type="GridSample", grid_size=0.02, hash_type="fnv", mode="train", return_grid_coord=True),
            dict(type="CenterShift", apply_z=False),
            dict(type="ToTensor"),
            dict(
                type="Collect",
                keys=("coord", "grid_coord", "origin_coord", "segment"),
                offset_keys_dict=dict(offset="coord", origin_offset="origin_coord"),
                feat_keys=["coord"],
            ),
        ],
        test_mode=False,
    ),
    test=dict(
        type=dataset_type,
        split="split",
        data_root=data_root,
        transform=[
            dict(type="CenterShift", apply_z=True),
        ],
        test_mode=True,
        test_cfg=dict(
            voxelize=dict(type="GridSample", grid_size=0.02, hash_type="fnv", mode="test", return_grid_coord=True),
            crop=None,
            post_transform=[
                dict(type="CenterShift", apply_z=False),
                dict(type="ToTensor"),
                dict(type="Collect", keys=("coord", "grid_coord","segment"), feat_keys=["coord"]),
            ],
            aug_transform=[
                [dict(type="RandomScale", scale=[0.95, 0.95])],
                [dict(type="RandomScale", scale=[1.0, 1.0])],
                [dict(type="RandomScale", scale=[1.05, 1.05])],
            ],
        ),
    ),
)
