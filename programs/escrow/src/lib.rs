use anchor_lang::prelude::*;

declare_id!("HttjUQRg1uvy2zs9HN1213PW8r1dqDXNHDhK9P1nvjen");

pub mod state;

pub mod instructions;
pub use instructions::*;

#[program]
pub mod turbin3_escrow {
    use super::*;

    pub fn initialize(ctx: Context<Make>, seed: u64, receive: u64) -> Result<()> {
        ctx.accounts.initialize_escrow(seed, receive, &ctx.bumps)?;
        // ctx.accounts.make(deposit)?;
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }

    pub fn make(ctx: Context<Make>, seed: u64, deposit: u64) -> Result<()> {
        ctx.accounts.make(deposit)?;
        Ok(())
    }

    pub fn take(ctx: Context<Take>, seed: u64) -> Result<()> {
        ctx.accounts.take()?;
        Ok(())
    }

    pub fn refund(ctx: Context<Refund>, seed: u64) -> Result<()> {
        ctx.accounts.refund_and_close()?;
        Ok(())
    }
}