<?php

use App\Support\EmvcoQrValidator;

test('parses standard EMVCo TLV tags into key-value map', function () {
    $payload = '00020101021153036085802PH63041234';

    $tags = EmvcoQrValidator::parse($payload);

    expect($tags)->toBeArray()
        ->and($tags['00'])->toBe('01')
        ->and($tags['01'])->toBe('11')
        ->and($tags['53'])->toBe('608')
        ->and($tags['58'])->toBe('PH')
        ->and($tags['63'])->toBe('1234');
});

test('passes valid static personal QR without amount', function () {
    $payload = '00020101021153036085802PH5914Juan Dela Cruz6006Manila63041234';

    $error = EmvcoQrValidator::validate($payload);

    expect($error)->toBeNull();
});

test('detects and rejects fixed amount embedded in Tag 54', function () {
    $payload = '00020101021153036085406150.005802PH5914Juan Dela Cruz6006Manila63041234';

    $error = EmvcoQrValidator::validate($payload);

    expect($error)->not->toBeNull()
        ->and($error)->toContain('fixed amount')
        ->and($error)->toContain('150.00');
});

test('detects and rejects dynamic single-use QR with Tag 01 set to 12', function () {
    $payload = '00020101021253036085802PH5914Juan Dela Cruz6006Manila63041234';

    $error = EmvcoQrValidator::validate($payload);

    expect($error)->not->toBeNull()
        ->and($error)->toContain('dynamic single-use QR code');
});

test('passes non-EMVCo custom payload without error', function () {
    $payload = 'https://getgcash.com/pay/me/user123';

    $error = EmvcoQrValidator::validate($payload);

    expect($error)->toBeNull();
});
