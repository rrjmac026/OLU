<?php

namespace Database\Seeders;

use App\Models\FarmAnimalType;
use App\Models\FarmCrop;
use App\Models\FarmDecorationType;
use App\Models\FarmQuest;
use Illuminate\Database\Seeder;

class FarmCatalogSeeder extends Seeder
{
    public function run(): void
    {
        // slug, name, emoji, seed_cost, sell_price (per unit), grow_seconds, xp, unlock_level
        $crops = [
            ['carrot', 'Carrot', '🥕', 5, 4, 60, 2, 1],
            ['tomato', 'Tomato', '🍅', 12, 10, 180, 4, 2],
            ['cabbage', 'Cabbage', '🥬', 20, 18, 420, 6, 3],
            ['corn', 'Corn', '🌽', 30, 27, 900, 9, 4],
            ['strawberry', 'Strawberry', '🍓', 45, 40, 1800, 14, 5],
            ['eggplant', 'Eggplant', '🍆', 60, 55, 3600, 20, 6],
        ];

        foreach ($crops as [$slug, $name, $emoji, $seed, $sell, $grow, $xp, $level]) {
            FarmCrop::updateOrCreate(['slug' => $slug], [
                'name' => $name, 'emoji' => $emoji, 'seed_cost' => $seed, 'sell_price' => $sell,
                'grow_seconds' => $grow, 'xp' => $xp, 'yield_qty' => 3,
                'unlock_level' => $level, 'is_active' => true,
            ]);
        }

        // slug, name, emoji, product_slug, product_name, product_emoji, buy_cost, product_price, seconds, xp, level
        $animals = [
            ['chicken', 'Chicken', '🐔', 'egg', 'Egg', '🥚', 150, 14, 600, 3, 1],
            ['duck', 'Duck', '🦆', 'duck_egg', 'Duck egg', '🥚', 250, 22, 900, 4, 3],
            ['cow', 'Cow', '🐄', 'milk', 'Milk', '🥛', 600, 45, 1800, 8, 4],
            ['sheep', 'Sheep', '🐑', 'wool', 'Wool', '🧶', 900, 70, 3600, 12, 6],
        ];

        foreach ($animals as [$slug, $name, $emoji, $pSlug, $pName, $pEmoji, $cost, $pPrice, $secs, $xp, $level]) {
            FarmAnimalType::updateOrCreate(['slug' => $slug], [
                'name' => $name, 'emoji' => $emoji, 'product_slug' => $pSlug,
                'product_name' => $pName, 'product_emoji' => $pEmoji, 'buy_cost' => $cost,
                'product_sell_price' => $pPrice, 'produce_seconds' => $secs, 'xp' => $xp,
                'unlock_level' => $level, 'is_active' => true,
            ]);
        }

        $decorations = [
            ['fence', 'Fence', '🪵', 30, 1],
            ['flower_bed', 'Flower bed', '🌸', 40, 1],
            ['scarecrow', 'Scarecrow', '🧑‍🌾', 80, 1],
            ['hay_bale', 'Hay bale', '🌾', 60, 2],
            ['lantern', 'Lantern', '🏮', 90, 3],
            ['pond', 'Little pond', '💧', 200, 3],
            ['picnic', 'Picnic blanket', '🧺', 150, 4],
            ['well', 'Wishing well', '⛲', 300, 5],
        ];

        foreach ($decorations as [$slug, $name, $emoji, $cost, $level]) {
            FarmDecorationType::updateOrCreate(['slug' => $slug], [
                'name' => $name, 'emoji' => $emoji, 'cost' => $cost,
                'unlock_level' => $level, 'is_active' => true,
            ]);
        }

        // slug, title, description, type, target, coins, xp, gems
        $quests = [
            ['first_seeds', 'Green thumbs', 'Plant 5 crops.', 'plant', 5, 50, 20, 0],
            ['first_harvest', 'First harvest', 'Harvest 5 plots.', 'harvest', 5, 80, 30, 0],
            ['water_10', 'Rain maker', 'Water crops 10 times.', 'water', 10, 60, 20, 2],
            ['first_sales', 'Market day', 'Sell 10 items at the stand.', 'sell', 10, 100, 25, 0],
            ['gather_5', 'Fresh from the coop', 'Collect 5 animal products.', 'collect', 5, 120, 30, 1],
            ['new_friend', 'A new friend', 'Buy an animal.', 'animal', 1, 100, 20, 0],
            ['harvest_30', 'Busy bees', 'Harvest 30 plots.', 'harvest', 30, 200, 60, 5],
            ['level_5', 'Growing up', 'Reach farm level 5.', 'level', 5, 300, 0, 10],
        ];

        foreach ($quests as $i => [$slug, $title, $desc, $type, $target, $coins, $xp, $gems]) {
            FarmQuest::updateOrCreate(['slug' => $slug], [
                'title' => $title, 'description' => $desc, 'type' => $type, 'target' => $target,
                'reward_coins' => $coins, 'reward_xp' => $xp, 'reward_gems' => $gems,
                'sort' => $i, 'is_active' => true,
            ]);
        }
    }
}