<?php

namespace App\Models;

use App\Enums\SettingKey;
use Database\Factories\SettingFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;

/**
 * @property int $id
 * @property string $key
 * @property string|null $value
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['key', 'value'])]
class Setting extends Model
{
    /** @use HasFactory<SettingFactory> */
    use HasFactory;

    /**
     * Get a setting value by key.
     */
    public static function get(string $key, ?string $default = null): ?string
    {
        return static::where('key', $key)->value('value') ?? $default;
    }

    /**
     * Set a setting value by key.
     */
    public static function set(string $key, ?string $value): self
    {
        return static::updateOrCreate(
            ['key' => $key],
            ['value' => $value]
        );
    }

    /**
     * Get a typed integer setting value by key with caching.
     */
    public static function integer(SettingKey $key): int
    {
        return (int) Cache::rememberForever("settings.{$key->value}", function () use ($key): int {
            $value = static::where('key', $key->value)->value('value');

            return $value !== null ? (int) $value : $key->default();
        });
    }

    /**
     * Set a typed integer setting value by key and invalidate its cache.
     */
    public static function put(SettingKey $key, int $value): void
    {
        static::updateOrCreate(
            ['key' => $key->value],
            ['value' => (string) $value]
        );

        Cache::forget("settings.{$key->value}");
    }
}
