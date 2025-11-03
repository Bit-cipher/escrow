use anchor_lang::prelude::*;

#[account]
#[derive(Default)]
pub struct Escrow {
    pub seed: u64,
    pub maker: Pubkey,
    pub mint_a: Pubkey,
    pub mint_b: Pubkey,
    pub receive: u64,
    pub offer: u64,
    pub bump: u8,
}

impl Escrow {
    // estimate init space: sum of fields
    // 8 (discriminator) + size of fields:
    // u64 (8) + Pubkey (32) *3 + u64 (8) + u8 (1) + padding
    pub const INIT_SPACE: usize = 8 + 8 + 32 + 32 + 32 + 8 + 1;
}
